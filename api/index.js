/**
 * Vercel Serverless Function — Bachelor 1 API
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
process.env.KEY_CLASS = 'b1';

const { buildApp } = require('../server/app');
const { initDB } = require('../../server/db');

let app;
let dbInitialized = false;

async function getApp() {
  if (!app) {
    app = buildApp({ logger: false });
    await app.ready();
  }
  if (!dbInitialized) {
    await initDB();
    dbInitialized = true;
  }
  return app;
}

module.exports = async function handler(req, res) {
  try {
    const fastify = await getApp();
    fastify.server.emit('request', req, res);
  } catch (err) {
    console.error('Erreur API B1 serverless:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Erreur serveur' }));
  }
};
