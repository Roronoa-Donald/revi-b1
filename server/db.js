const { Pool } = require('pg');

let pool;

/**
 * Initialise la connexion PostgreSQL et crée les tables
 */
async function initDB() {
  const dbUrl = process.env.DATABASE_URL || '';
  const needsSSL = dbUrl.includes('sslmode=require') || dbUrl.includes('sslmode=verify') || process.env.NODE_ENV === 'production';

  // Retirer sslmode de l'URL pour éviter que pg le convertisse en verify-full
  const cleanUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');

  pool = new Pool({
    connectionString: cleanUrl,
    ssl: needsSSL ? { rejectUnauthorized: false } : false
  });

  // Protection contre les erreurs de pool non gérées
  pool.on('error', (err) => {
    console.error('❌ Erreur inattendue du pool PostgreSQL:', err.message);
  });

  // Test de connexion
  const client = await pool.connect();
  console.log('✅ Connexion PostgreSQL établie');

  // Création des tables
  await client.query(`
    CREATE TABLE IF NOT EXISTS activation_keys (
      id SERIAL PRIMARY KEY,
      key_code VARCHAR(9) UNIQUE NOT NULL,
      scope VARCHAR(255) NOT NULL DEFAULT 'all',
      is_used BOOLEAN DEFAULT FALSE,
      used_at TIMESTAMP,
      machine_fingerprint VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      note VARCHAR(255),
      expires_at TIMESTAMP DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      key_id INTEGER REFERENCES activation_keys(id) ON DELETE CASCADE,
      jti VARCHAR(255) UNIQUE NOT NULL,
      machine_fingerprint VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_verified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_valid BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      key_id INTEGER REFERENCES activation_keys(id) ON DELETE SET NULL,
      session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
      key_code VARCHAR(9),
      scope VARCHAR(255),
      course VARCHAR(100),
      ip_address VARCHAR(50),
      machine_fingerprint VARCHAR(255),
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_keys_code ON activation_keys(key_code);
    CREATE INDEX IF NOT EXISTS idx_sessions_jti ON sessions(jti);
    CREATE INDEX IF NOT EXISTS idx_sessions_key_id ON sessions(key_id);
    CREATE INDEX IF NOT EXISTS idx_logs_event ON activity_logs(event_type);
    CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_key_id ON activity_logs(key_id);
  `);

  // Ajouter la colonne expires_at si elle n'existe pas (pour migrations)
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activation_keys' AND column_name='expires_at') THEN
        ALTER TABLE activation_keys ADD COLUMN expires_at TIMESTAMP DEFAULT NULL;
      END IF;
    END $$;
  `);

  // Index sur expires_at (après migration)
  await client.query(`CREATE INDEX IF NOT EXISTS idx_keys_expires ON activation_keys(expires_at);`);

  // Migration : ajouter la colonne class (b1/b2) pour séparer les clés Bachelor 1 / Bachelor 2
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activation_keys' AND column_name='class') THEN
        ALTER TABLE activation_keys ADD COLUMN class VARCHAR(10) DEFAULT 'b2';
      END IF;
    END $$;
  `);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_keys_class ON activation_keys(class);`);
  // Mettre à jour les clés existantes sans class vers 'b2'
  await client.query(`UPDATE activation_keys SET class = 'b2' WHERE class IS NULL;`);

  // Migration : ajouter la colonne platform (b1/b2) aux sessions pour permettre les sessions parallèles
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='platform') THEN
        ALTER TABLE sessions ADD COLUMN platform VARCHAR(10) DEFAULT 'b2';
      END IF;
    END $$;
  `);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_platform ON sessions(platform);`);

  // Créer la fonction trigger pour logger automatiquement les changements de clés
  await client.query(`
    CREATE OR REPLACE FUNCTION log_key_changes() RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (event_type, key_id, key_code, scope, details)
        VALUES ('key_created', NEW.id, NEW.key_code, NEW.scope, 'Clé créée' || COALESCE(' - ' || NEW.note, ''));
      ELSIF TG_OP = 'UPDATE' THEN
        -- Détecter les changements spécifiques
        IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
          INSERT INTO activity_logs (event_type, key_id, key_code, scope, details)
          VALUES ('key_revoked', NEW.id, NEW.key_code, NEW.scope, 'Clé révoquée');
        ELSIF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
          INSERT INTO activity_logs (event_type, key_id, key_code, scope, details)
          VALUES ('key_reactivated', NEW.id, NEW.key_code, NEW.scope, 'Clé réactivée');
        ELSIF OLD.is_used = FALSE AND NEW.is_used = TRUE THEN
          INSERT INTO activity_logs (event_type, key_id, key_code, scope, details, machine_fingerprint)
          VALUES ('key_activated', NEW.id, NEW.key_code, NEW.scope, 'Clé activée sur une machine', NEW.machine_fingerprint);
        ELSIF OLD.is_used = TRUE AND NEW.is_used = FALSE THEN
          INSERT INTO activity_logs (event_type, key_id, key_code, scope, details)
          VALUES ('key_reset', NEW.id, NEW.key_code, NEW.scope, 'Clé réinitialisée');
        END IF;
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_logs (event_type, key_code, scope, details)
        VALUES ('key_deleted', OLD.key_code, OLD.scope, 'Clé supprimée définitivement');
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_key_changes ON activation_keys;
    CREATE TRIGGER trg_key_changes
    AFTER INSERT OR UPDATE OR DELETE ON activation_keys
    FOR EACH ROW EXECUTE FUNCTION log_key_changes();
  `);

  // Trigger pour logger les changements de sessions
  await client.query(`
    CREATE OR REPLACE FUNCTION log_session_changes() RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (event_type, session_id, key_id, machine_fingerprint, details)
        VALUES ('session_created', NEW.id, NEW.key_id, NEW.machine_fingerprint, 'Nouvelle session');
      ELSIF TG_OP = 'UPDATE' AND OLD.is_valid = TRUE AND NEW.is_valid = FALSE THEN
        INSERT INTO activity_logs (event_type, session_id, key_id, machine_fingerprint, details)
        VALUES ('session_revoked', NEW.id, NEW.key_id, NEW.machine_fingerprint, 'Session révoquée');
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_session_changes ON sessions;
    CREATE TRIGGER trg_session_changes
    AFTER INSERT OR UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION log_session_changes();
  `);

  console.log('✅ Tables, index et triggers créés / vérifiés');
  client.release();
}

/**
 * Exécute une requête SQL
 */
async function query(text, params) {
  return pool.query(text, params);
}

// ========================
// CRUD Clés d'activation
// ========================

async function createKey(keyCode, scope, note, expiresAt, keyClass) {
  const result = await query(
    'INSERT INTO activation_keys (key_code, scope, note, expires_at, class) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [keyCode, scope, note || null, expiresAt || null, keyClass || 'b2']
  );
  return result.rows[0];
}

async function getKeyByCode(keyCode) {
  const result = await query('SELECT * FROM activation_keys WHERE key_code = $1', [keyCode]);
  return result.rows[0];
}

async function getKeyById(id) {
  const result = await query('SELECT * FROM activation_keys WHERE id = $1', [id]);
  return result.rows[0];
}

async function getAllKeys(filter, search) {
  let sql = 'SELECT * FROM activation_keys';
  const conditions = [];
  const params = [];

  if (filter === 'active') {
    conditions.push('is_active = TRUE AND is_used = FALSE');
  } else if (filter === 'used') {
    conditions.push('is_used = TRUE');
  } else if (filter === 'revoked') {
    conditions.push('is_active = FALSE');
  } else if (filter === 'expired') {
    conditions.push('expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP');
  }

  if (search && search.trim()) {
    params.push('%' + search.trim() + '%');
    conditions.push('(key_code ILIKE $' + params.length + ' OR note ILIKE $' + params.length + ' OR scope ILIKE $' + params.length + ')');
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function markKeyUsed(keyId, fingerprint) {
  const result = await query(
    'UPDATE activation_keys SET is_used = TRUE, used_at = CURRENT_TIMESTAMP, machine_fingerprint = $1 WHERE id = $2 RETURNING *',
    [fingerprint, keyId]
  );
  return result.rows[0];
}

async function resetKey(keyId) {
  // Invalider toutes les sessions liées
  await query('UPDATE sessions SET is_valid = FALSE WHERE key_id = $1', [keyId]);
  // Réinitialiser la clé
  const result = await query(
    'UPDATE activation_keys SET is_used = FALSE, used_at = NULL, machine_fingerprint = NULL WHERE id = $1 RETURNING *',
    [keyId]
  );
  return result.rows[0];
}

async function revokeKey(keyId) {
  // Invalider toutes les sessions liées
  await query('UPDATE sessions SET is_valid = FALSE WHERE key_id = $1', [keyId]);
  // Désactiver la clé
  const result = await query(
    'UPDATE activation_keys SET is_active = FALSE WHERE id = $1 RETURNING *',
    [keyId]
  );
  return result.rows[0];
}

async function reactivateKey(keyId) {
  const result = await query(
    'UPDATE activation_keys SET is_active = TRUE WHERE id = $1 RETURNING *',
    [keyId]
  );
  return result.rows[0];
}

async function deleteKey(keyId) {
  await query('DELETE FROM sessions WHERE key_id = $1', [keyId]);
  await query('DELETE FROM activation_keys WHERE id = $1', [keyId]);
}

// ========================
// CRUD Sessions
// ========================

async function createSession(keyId, jti, fingerprint, platform) {
  const result = await query(
    'INSERT INTO sessions (key_id, jti, machine_fingerprint, platform) VALUES ($1, $2, $3, $4) RETURNING *',
    [keyId, jti, fingerprint, platform || 'b2']
  );
  return result.rows[0];
}

async function getSessionByJti(jti) {
  const result = await query('SELECT * FROM sessions WHERE jti = $1', [jti]);
  return result.rows[0];
}

async function getAllSessions() {
  const result = await query(`
    SELECT s.*, k.key_code, k.scope, k.note
    FROM sessions s
    JOIN activation_keys k ON s.key_id = k.id
    ORDER BY s.created_at DESC
  `);
  return result.rows;
}

async function revokeSession(sessionId) {
  const result = await query(
    'UPDATE sessions SET is_valid = FALSE WHERE id = $1 RETURNING *',
    [sessionId]
  );
  return result.rows[0];
}

async function revokeSessionByJti(jti) {
  const result = await query(
    'UPDATE sessions SET is_valid = FALSE WHERE jti = $1 RETURNING *',
    [jti]
  );
  return result.rows[0];
}

async function updateSessionVerified(jti) {
  await query('UPDATE sessions SET last_verified = CURRENT_TIMESTAMP WHERE jti = $1', [jti]);
}

// ========================
// Statistiques
// ========================

async function getStats() {
  const result = await query(`
    SELECT
      (SELECT COUNT(*) FROM activation_keys) as total_keys,
      (SELECT COUNT(*) FROM activation_keys WHERE is_used = TRUE AND is_active = TRUE) as used_keys,
      (SELECT COUNT(*) FROM activation_keys WHERE is_used = FALSE AND is_active = TRUE) as available_keys,
      (SELECT COUNT(*) FROM activation_keys WHERE is_active = FALSE) as revoked_keys,
      (SELECT COUNT(*) FROM sessions WHERE is_valid = TRUE) as active_sessions,
      (SELECT COUNT(*) FROM activation_keys WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP) as expired_keys
  `);
  return result.rows[0];
}

/**
 * Stats par cours
 */
async function getStatsByCourse() {
  const result = await query(`
    SELECT
      unnest(string_to_array(scope, ',')) as course,
      COUNT(*) as total_keys,
      COUNT(*) FILTER (WHERE is_used = TRUE AND is_active = TRUE) as used_keys,
      COUNT(*) FILTER (WHERE is_used = FALSE AND is_active = TRUE) as available_keys,
      COUNT(*) FILTER (WHERE is_active = FALSE) as revoked_keys
    FROM activation_keys
    WHERE scope != 'all'
    GROUP BY course
    ORDER BY course
  `);
  // Ajouter les stats pour 'all'
  const allResult = await query(`
    SELECT
      COUNT(*) as total_keys,
      COUNT(*) FILTER (WHERE is_used = TRUE AND is_active = TRUE) as used_keys,
      COUNT(*) FILTER (WHERE is_used = FALSE AND is_active = TRUE) as available_keys,
      COUNT(*) FILTER (WHERE is_active = FALSE) as revoked_keys
    FROM activation_keys
    WHERE scope = 'all'
  `);
  return {
    byCourse: result.rows,
    allScope: allResult.rows[0]
  };
}

// ========================
// Logs d'activité
// ========================

async function logActivity(eventType, data = {}) {
  try {
    await query(
      `INSERT INTO activity_logs (event_type, key_id, session_id, key_code, scope, course, ip_address, machine_fingerprint, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        eventType,
        data.keyId || null,
        data.sessionId || null,
        data.keyCode || null,
        data.scope || null,
        data.course || null,
        data.ip || null,
        data.fingerprint || null,
        data.details || null
      ]
    );
  } catch (err) {
    console.error('Erreur log activité:', err.message);
  }
}

async function getActivityLogs(limit = 100, offset = 0, eventType = null) {
  let sql = 'SELECT * FROM activity_logs';
  const params = [];
  if (eventType) {
    params.push(eventType);
    sql += ' WHERE event_type = $1';
  }
  sql += ' ORDER BY created_at DESC';
  params.push(limit);
  sql += ' LIMIT $' + params.length;
  params.push(offset);
  sql += ' OFFSET $' + params.length;
  const result = await query(sql, params);
  return result.rows;
}

async function getActivityLogsCount(eventType = null) {
  let sql = 'SELECT COUNT(*) as count FROM activity_logs';
  const params = [];
  if (eventType) {
    params.push(eventType);
    sql += ' WHERE event_type = $1';
  }
  const result = await query(sql, params);
  return parseInt(result.rows[0].count);
}

// ========================
// Class-filtered functions (B1/B2 separation)
// ========================

async function getAllKeysByClass(keyClass, filter, search) {
  let sql = 'SELECT * FROM activation_keys';
  const conditions = ['class = $1'];
  const params = [keyClass];

  if (filter === 'active') {
    conditions.push('is_active = TRUE AND is_used = FALSE');
  } else if (filter === 'used') {
    conditions.push('is_used = TRUE');
  } else if (filter === 'revoked') {
    conditions.push('is_active = FALSE');
  } else if (filter === 'expired') {
    conditions.push('expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP');
  }

  if (search && search.trim()) {
    params.push('%' + search.trim() + '%');
    conditions.push('(key_code ILIKE $' + params.length + ' OR note ILIKE $' + params.length + ' OR scope ILIKE $' + params.length + ')');
  }

  sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function getStatsByClass(keyClass) {
  const result = await query(`
    SELECT
      (SELECT COUNT(*) FROM activation_keys WHERE class = $1) as total_keys,
      (SELECT COUNT(*) FROM activation_keys WHERE class = $1 AND is_used = TRUE AND is_active = TRUE) as used_keys,
      (SELECT COUNT(*) FROM activation_keys WHERE class = $1 AND is_used = FALSE AND is_active = TRUE) as available_keys,
      (SELECT COUNT(*) FROM activation_keys WHERE class = $1 AND is_active = FALSE) as revoked_keys,
      (SELECT COUNT(*) FROM sessions s JOIN activation_keys k ON s.key_id = k.id WHERE k.class = $1 AND s.is_valid = TRUE) as active_sessions,
      (SELECT COUNT(*) FROM activation_keys WHERE class = $1 AND expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP) as expired_keys
  `, [keyClass]);
  return result.rows[0];
}

async function getStatsByCourseByClass(keyClass) {
  const result = await query(`
    SELECT
      unnest(string_to_array(scope, ',')) as course,
      COUNT(*) as total_keys,
      COUNT(*) FILTER (WHERE is_used = TRUE AND is_active = TRUE) as used_keys,
      COUNT(*) FILTER (WHERE is_used = FALSE AND is_active = TRUE) as available_keys,
      COUNT(*) FILTER (WHERE is_active = FALSE) as revoked_keys
    FROM activation_keys
    WHERE scope != 'all' AND class = $1
    GROUP BY course
    ORDER BY course
  `, [keyClass]);
  const allResult = await query(`
    SELECT
      COUNT(*) as total_keys,
      COUNT(*) FILTER (WHERE is_used = TRUE AND is_active = TRUE) as used_keys,
      COUNT(*) FILTER (WHERE is_used = FALSE AND is_active = TRUE) as available_keys,
      COUNT(*) FILTER (WHERE is_active = FALSE) as revoked_keys
    FROM activation_keys
    WHERE scope = 'all' AND class = $1
  `, [keyClass]);
  return {
    byCourse: result.rows,
    allScope: allResult.rows[0]
  };
}

async function getAllSessionsByClass(keyClass) {
  const result = await query(`
    SELECT s.*, k.key_code, k.scope, k.note
    FROM sessions s
    JOIN activation_keys k ON s.key_id = k.id
    WHERE k.class = $1
    ORDER BY s.created_at DESC
  `, [keyClass]);
  return result.rows;
}

async function getActivityLogsByClass(keyClass, limit = 100, offset = 0, eventType = null) {
  let sql = `SELECT al.* FROM activity_logs al
    LEFT JOIN activation_keys ak ON al.key_id = ak.id
    WHERE (ak.class = $1 OR al.key_id IS NULL)`;
  const params = [keyClass];
  if (eventType) {
    params.push(eventType);
    sql += ' AND al.event_type = $' + params.length;
  }
  sql += ' ORDER BY al.created_at DESC';
  params.push(limit);
  sql += ' LIMIT $' + params.length;
  params.push(offset);
  sql += ' OFFSET $' + params.length;
  const result = await query(sql, params);
  return result.rows;
}

async function getActivityLogsCountByClass(keyClass, eventType = null) {
  let sql = `SELECT COUNT(*) as count FROM activity_logs al
    LEFT JOIN activation_keys ak ON al.key_id = ak.id
    WHERE (ak.class = $1 OR al.key_id IS NULL)`;
  const params = [keyClass];
  if (eventType) {
    params.push(eventType);
    sql += ' AND al.event_type = $' + params.length;
  }
  const result = await query(sql, params);
  return parseInt(result.rows[0].count);
}

module.exports = {
  initDB,
  query,
  createKey,
  getKeyByCode,
  getKeyById,
  getAllKeys,
  markKeyUsed,
  resetKey,
  revokeKey,
  reactivateKey,
  deleteKey,
  createSession,
  getSessionByJti,
  getAllSessions,
  revokeSession,
  revokeSessionByJti,
  updateSessionVerified,
  getStats,
  getStatsByCourse,
  logActivity,
  getActivityLogs,
  getActivityLogsCount,
  // Class-filtered variants for B1/B2 separation
  getAllKeysByClass,
  getStatsByClass,
  getStatsByCourseByClass,
  getAllSessionsByClass,
  getActivityLogsByClass,
  getActivityLogsCountByClass
};
