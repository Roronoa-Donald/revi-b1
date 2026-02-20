const jwt = require('jsonwebtoken');
const db = require('../db');
const { generateActivationKey } = require('../utils/keygen');
const { COURSES } = require('../middleware/access-control');

const JWT_SECRET = process.env.JWT_SECRET;
const IS_PROD = process.env.NODE_ENV === 'production';
const KEY_CLASS = 'b1';

function verifyAdmin(request) {
  try {
    const token = request.cookies.admin_token;
    if (!token) return false;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.admin === true;
  } catch {
    return false;
  }
}

module.exports = async function adminRoutes(fastify) {

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url === '/api/admin/login' && request.method === 'POST') return;
    if (request.url.startsWith('/api/admin/courses')) return;
    if (!verifyAdmin(request)) {
      return reply.code(401).send({ success: false, message: 'Non autorisé' });
    }
  });

  fastify.post('/login', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    try {
      const { username, password } = request.body || {};
      if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '8h' });
        reply.setCookie('admin_token', token, {
          httpOnly: true, secure: IS_PROD, sameSite: 'lax',
          path: '/', maxAge: 8 * 60 * 60,
          domain: process.env.COOKIE_DOMAIN || undefined
        });
        await db.logActivity('admin_login', { ip: request.ip, details: 'Connexion admin B1' });
        return reply.send({ success: true, message: 'Connexion réussie' });
      }
      await db.logActivity('admin_login_failed', { ip: request.ip, details: 'Échec connexion admin B1 - user: ' + (username || '(vide)') });
      return reply.code(401).send({ success: false, message: 'Identifiants incorrects' });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ success: false, message: 'Erreur serveur' });
    }
  });

  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie('admin_token', { path: '/' });
    return reply.send({ success: true });
  });

  fastify.get('/verify', async (request, reply) => {
    return reply.send({ authenticated: true });
  });

  fastify.get('/courses', async (request, reply) => {
    return reply.send(COURSES);
  });

  fastify.get('/stats', async (request, reply) => {
    try {
      const stats = await db.getStatsByClass(KEY_CLASS);
      return reply.send(stats);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });

  fastify.get('/keys', async (request, reply) => {
    try {
      const { filter, search } = request.query;
      const keys = await db.getAllKeysByClass(KEY_CLASS, filter, search);
      return reply.send(keys);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });

  fastify.post('/keys', async (request, reply) => {
    try {
      const { scope = 'all', note = '', count = 1, expiresIn = null } = request.body || {};
      const numKeys = Math.min(Math.max(1, parseInt(count) || 1), 50);
      let expiresAt = null;
      if (expiresIn && expiresIn !== 'never') {
        const now = new Date();
        const durations = { '7d': 7*864e5, '30d': 30*864e5, '90d': 90*864e5, '180d': 180*864e5, '365d': 365*864e5 };
        if (durations[expiresIn]) expiresAt = new Date(now.getTime() + durations[expiresIn]);
      }
      const createdKeys = [];
      for (let i = 0; i < numKeys; i++) {
        const keyCode = generateActivationKey();
        const key = await db.createKey(keyCode, scope, note, expiresAt, KEY_CLASS);
        createdKeys.push(key);
      }
      return reply.send({ success: true, message: `${numKeys} clé(s) B1 créée(s)`, keys: createdKeys });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ success: false, message: 'Erreur lors de la création' });
    }
  });

  fastify.post('/keys/:id/reset', async (request, reply) => {
    try {
      const key = await db.resetKey(parseInt(request.params.id));
      if (!key) return reply.code(404).send({ success: false, message: 'Clé introuvable' });
      return reply.send({ success: true, message: 'Clé réinitialisée.', key });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ success: false, message: 'Erreur serveur' });
    }
  });

  fastify.post('/keys/:id/revoke', async (request, reply) => {
    try {
      const key = await db.revokeKey(parseInt(request.params.id));
      if (!key) return reply.code(404).send({ success: false, message: 'Clé introuvable' });
      return reply.send({ success: true, message: 'Clé révoquée.', key });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ success: false, message: 'Erreur serveur' });
    }
  });

  fastify.post('/keys/:id/reactivate', async (request, reply) => {
    try {
      const key = await db.reactivateKey(parseInt(request.params.id));
      if (!key) return reply.code(404).send({ success: false, message: 'Clé introuvable' });
      return reply.send({ success: true, message: 'Clé réactivée.', key });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ success: false, message: 'Erreur serveur' });
    }
  });

  fastify.delete('/keys/:id', async (request, reply) => {
    try {
      await db.deleteKey(parseInt(request.params.id));
      return reply.send({ success: true, message: 'Clé supprimée définitivement' });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ success: false, message: 'Erreur serveur' });
    }
  });

  fastify.get('/sessions', async (request, reply) => {
    try {
      const sessions = await db.getAllSessionsByClass(KEY_CLASS);
      return reply.send(sessions);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });

  fastify.post('/sessions/:id/revoke', async (request, reply) => {
    try {
      const session = await db.revokeSession(parseInt(request.params.id));
      if (!session) return reply.code(404).send({ success: false, message: 'Session introuvable' });
      return reply.send({ success: true, message: 'Session révoquée.', session });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ success: false, message: 'Erreur serveur' });
    }
  });

  fastify.get('/stats/courses', async (request, reply) => {
    try {
      const stats = await db.getStatsByCourseByClass(KEY_CLASS);
      return reply.send(stats);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });

  fastify.get('/logs', async (request, reply) => {
    try {
      const { limit = 100, offset = 0, type = null } = request.query;
      const [logs, total] = await Promise.all([
        db.getActivityLogsByClass(KEY_CLASS, parseInt(limit), parseInt(offset), type || null),
        db.getActivityLogsCountByClass(KEY_CLASS, type || null)
      ]);
      return reply.send({ logs, total, limit: parseInt(limit), offset: parseInt(offset) });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });
};
