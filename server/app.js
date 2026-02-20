/**
 * Application Fastify — Bachelor 1
 * Utilisée par :
 *   - b1/server.js (Render / local) → ajoute le serveur de fichiers statiques + listen()
 *   - b1/api/index.js (Vercel) → expose en serverless function
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Forcer KEY_CLASS=b1 pour le backend B1
process.env.KEY_CLASS = 'b1';

function buildApp(opts = {}) {
  const fastify = require('fastify')({
    logger: opts.logger !== undefined ? opts.logger : true,
    bodyLimit: 1048576
  });

  // Plugins
  fastify.register(require('@fastify/cookie'));
  fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  });
  fastify.register(require('@fastify/helmet'), {
    contentSecurityPolicy: false
  });
  fastify.register(require('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
  });

  // Routes API
  fastify.register(require('./routes/auth'), { prefix: '/api' });
  fastify.register(require('./routes/admin'), { prefix: '/api/admin' });

  // AI Chat route — shared with B2
  try {
    fastify.register(require('../../server/routes/ai-chat'), { prefix: '/api' });
  } catch (e) {
    console.warn('⚠️ AI chat route non disponible:', e.message);
  }

  return fastify;
}

module.exports = { buildApp };
