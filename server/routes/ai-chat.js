/**
 * Route proxy pour le chat IA (RD-AI)
 * Proxy les requêtes vers OpenRouter sans exposer la clé API côté client
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function aiChatRoutes(fastify) {

  // Rate-limit spécifique pour le chat IA (plus restrictif)
  fastify.post('/ai-chat', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    // Vérification d'authentification
    const token = request.cookies?.auth_token;
    if (!token) {
      return reply.code(401).send({ error: 'Authentification requise pour utiliser le chat IA' });
    }
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return reply.code(401).send({ error: 'Session invalide ou expirée' });
    }

    if (!OPENROUTER_API_KEY) {
      return reply.code(503).send({ error: 'Service IA non configuré (OPENROUTER_API_KEY manquante)' });
    }

    const { messages, model, max_tokens, temperature, stream } = request.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return reply.code(400).send({ error: 'Messages requis' });
    }

    // Limiter la taille des messages pour éviter les abus
    const safeMessages = messages.slice(-25).map(m => ({
      role: m.role === 'system' || m.role === 'user' || m.role === 'assistant' ? m.role : 'user',
      content: typeof m.content === 'string' ? m.content.slice(0, 4000) : ''
    }));

    const body = JSON.stringify({
      model: model || 'deepseek/deepseek-chat',
      messages: safeMessages,
      max_tokens: Math.min(max_tokens || 2048, 4096),
      temperature: typeof temperature === 'number' ? Math.min(temperature, 1.5) : 0.7,
      stream: !!stream
    });

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.SITE_URL || 'https://b1.vercel.app',
          'X-Title': 'RD-AI Cours Interactifs B1'
        },
        body
      });

      if (!response.ok) {
        const errText = await response.text();
        fastify.log.error(`OpenRouter error ${response.status}: ${errText}`);
        return reply.code(response.status).send({ error: `API Error ${response.status}` });
      }

      if (stream) {
        // Streaming : relayer le flux SSE directement
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            reply.raw.write(decoder.decode(value, { stream: true }));
          }
        } catch (e) {
          // Client disconnected
        } finally {
          reply.raw.end();
        }
        return;
      }

      // Non-streaming : retourner la réponse JSON
      const data = await response.json();
      return reply.send(data);

    } catch (err) {
      fastify.log.error('AI Chat proxy error:', err);
      return reply.code(500).send({ error: 'Erreur du service IA' });
    }
  });
}

module.exports = aiChatRoutes;
