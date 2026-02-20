const jwt = require('jsonwebtoken');
const db = require('../../../server/db');
const { generateJti, hashFingerprint } = require('../../../server/utils/keygen');
const { COURSES, COURSE_ICONS, COURSE_THEMES } = require('../middleware/access-control');

const JWT_SECRET = process.env.JWT_SECRET;
const IS_PROD = process.env.NODE_ENV === 'production';

module.exports = async function authRoutes(fastify) {

  /**
   * GET /api/course-info?course=xxx
   * Retourne le nom et l'icône d'un cours B1
   */
  fastify.get('/course-info', async (request, reply) => {
    const { course } = request.query;
    if (course && COURSES[course]) {
      return reply.send({
        id: course,
        name: COURSES[course],
        icon: COURSE_ICONS[course] || '📚',
        theme: COURSE_THEMES[course] || null
      });
    }
    return reply.send({ id: null, name: null, icon: '🔑', theme: null });
  });

  /**
   * POST /api/activate
   * Active une clé et crée une session
   * Accepte les clés B1 ET B2 (B2 a accès à B1)
   */
  fastify.post('/activate', {
    config: {
      rateLimit: { max: 5, timeWindow: '1 minute' }
    }
  }, async (request, reply) => {
    try {
      const { key, fingerprint } = request.body || {};

      if (!key || !fingerprint) {
        return reply.code(400).send({ success: false, message: 'Clé d\'activation et fingerprint requis' });
      }

      const keyRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
      if (!keyRegex.test(key.toUpperCase())) {
        return reply.code(400).send({ success: false, message: 'Format de clé invalide. Attendu: XXXX-XXXX' });
      }

      const keyCode = key.toUpperCase();
      const fpHash = hashFingerprint(fingerprint);

      const keyRecord = await db.getKeyByCode(keyCode);

      if (!keyRecord) {
        return reply.code(404).send({ success: false, message: 'Clé d\'activation introuvable' });
      }

      // B1 accepte les clés B1 ET B2 (B2 peut accéder aux cours B1)
      if (keyRecord.class !== 'b1' && keyRecord.class !== 'b2') {
        return reply.code(403).send({ success: false, message: 'Cette clé n\'est pas valide pour cette plateforme.' });
      }

      if (!keyRecord.is_active) {
        return reply.code(403).send({ success: false, message: 'Cette clé a été révoquée par l\'administrateur' });
      }

      if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
        return reply.code(403).send({ success: false, message: 'Cette clé a expiré. Contactez l\'administrateur.' });
      }

      if (keyRecord.is_used) {
        if (keyRecord.machine_fingerprint !== fpHash) {
          return reply.code(403).send({
            success: false,
            message: 'Cette clé est déjà utilisée sur un autre appareil. Contactez l\'administrateur pour une réinitialisation.'
          });
        }
        const oldSessions = await db.query(
          'SELECT jti FROM sessions WHERE key_id = $1 AND is_valid = TRUE AND platform = $2',
          [keyRecord.id, 'b1']
        );
        for (const s of oldSessions.rows) {
          await db.revokeSessionByJti(s.jti);
        }
      } else {
        await db.markKeyUsed(keyRecord.id, fpHash);
      }

      const jti = generateJti();
      await db.createSession(keyRecord.id, jti, fpHash, 'b1');

      const token = jwt.sign(
        {
          keyId: keyRecord.id,
          scope: keyRecord.scope,
          jti: jti,
          keyClass: keyRecord.class
        },
        JWT_SECRET,
        { expiresIn: '365d' }
      );

      reply.setCookie('auth_token', token, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        domain: process.env.COOKIE_DOMAIN || undefined
      });

      await db.logActivity('activation', {
        keyId: keyRecord.id,
        keyCode: keyCode,
        scope: keyRecord.scope,
        ip: request.ip,
        fingerprint: fpHash,
        details: 'Clé activée (B1) — class=' + keyRecord.class
      });

      return reply.send({
        success: true,
        scope: keyRecord.scope,
        message: 'Clé activée avec succès ! Vous avez maintenant accès aux contenus Bachelor 1.'
      });

    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ success: false, message: 'Erreur serveur lors de l\'activation' });
    }
  });

  /**
   * GET /api/verify
   */
  fastify.get('/verify', async (request, reply) => {
    try {
      const token = request.cookies.auth_token;
      if (!token) return reply.send({ authenticated: false });

      const decoded = jwt.verify(token, JWT_SECRET);
      const session = await db.getSessionByJti(decoded.jti);
      if (!session || !session.is_valid) return reply.send({ authenticated: false });

      const keyRecord = await db.getKeyById(decoded.keyId);
      if (!keyRecord || !keyRecord.is_active) return reply.send({ authenticated: false });

      // B1 accepte clés B1 et B2
      if (keyRecord.class !== 'b1' && keyRecord.class !== 'b2') {
        return reply.send({ authenticated: false });
      }

      await db.updateSessionVerified(decoded.jti);

      return reply.send({
        authenticated: true,
        scope: decoded.scope,
        keyClass: keyRecord.class
      });

    } catch (err) {
      return reply.send({ authenticated: false });
    }
  });

  /**
   * POST /api/verify-fingerprint
   */
  fastify.post('/verify-fingerprint', async (request, reply) => {
    return reply.send({ valid: true });
  });

  /**
   * POST /api/logout
   */
  fastify.post('/logout', async (request, reply) => {
    try {
      const token = request.cookies.auth_token;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          await db.revokeSessionByJti(decoded.jti);
        } catch (e) { /* token invalide */ }
      }
      reply.clearCookie('auth_token', { path: '/' });
      return reply.send({ success: true });
    } catch (err) {
      return reply.code(500).send({ success: false });
    }
  });
};
