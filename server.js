require('dotenv').config();
process.env.KEY_CLASS = 'b1';

const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const jwt = require('jsonwebtoken');
const { buildApp } = require('./server/app');
const { initDB, getSessionByJti, getKeyById, updateSessionVerified } = require('./server/db');
const { isProtected, getCourseFromUrl, COURSES } = require('./server/middleware/access-control');

const fastify = buildApp({ logger: true });

const SITE_ROOT = __dirname;
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.B1_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const IS_PROD = process.env.NODE_ENV === 'production';

const BLOCKED_PATHS = ['/server/', '/node_modules/', '/public/', '/.env', '/.git/', '/package.json', '/package-lock.json', '/api/', '/scripts/', '/dist/', '/vercel.json', '/.vercelignore'];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.map': 'application/json',
  '.py': 'text/plain; charset=utf-8'
};

async function verifyUserAuth(request) {
  try {
    const token = request.cookies.auth_token;
    if (!token) return { valid: false };

    const decoded = jwt.verify(token, JWT_SECRET);
    const session = await getSessionByJti(decoded.jti);
    if (!session || !session.is_valid) return { valid: false };

    const keyRecord = await getKeyById(decoded.keyId);
    if (!keyRecord || !keyRecord.is_active) return { valid: false };

    // B1 accepte clés B1 et B2
    if (keyRecord.class !== 'b1' && keyRecord.class !== 'b2') return { valid: false };

    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) return { valid: false };

    await updateSessionVerified(decoded.jti);
    return { valid: true, scope: decoded.scope, keyId: decoded.keyId, keyClass: keyRecord.class };
  } catch (err) {
    return { valid: false };
  }
}

function verifyAdminForPage(request) {
  try {
    const token = request.cookies.admin_token;
    if (!token) return false;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.admin === true;
  } catch {
    return false;
  }
}

const AUTH_INJECT_HEAD = '<link rel="stylesheet" href="/_auth/css/auth-styles.css">';
const AUTH_INJECT_BODY = '<script src="/_auth/js/fingerprint.js"></script>\n<script src="/_auth/js/auth-check.js"></script>';

fastify.get('/*', async (request, reply) => {
  let urlPath = decodeURIComponent(request.url.split('?')[0]);
  const queryString = request.url.includes('?') ? request.url.substring(request.url.indexOf('?')) : '';

  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  // Servir /_auth/* depuis public/
  if (urlPath.startsWith('/_auth/')) {
    const relativePath = urlPath.replace('/_auth/', '');
    const filePath = path.join(PUBLIC_DIR, relativePath);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(PUBLIC_DIR))) return reply.code(403).send('Forbidden');

    if (relativePath.startsWith('admin/dashboard')) {
      if (!verifyAdminForPage(request)) return reply.redirect('/_auth/admin/login.html');
    }

    try {
      await fsPromises.access(filePath);
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = await fsPromises.readFile(filePath);
      return reply.type(contentType).send(content);
    } catch {
      return reply.code(404).type('text/html').send('<h1>404 - Page non trouvée</h1>');
    }
  }

  // Bloquer fichiers sensibles
  for (const blocked of BLOCKED_PATHS) {
    if (urlPath.startsWith(blocked) || urlPath === blocked) return reply.code(403).send('Forbidden');
  }

  const filePath = path.join(SITE_ROOT, urlPath);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(SITE_ROOT))) return reply.code(403).send('Forbidden');

  try {
    const stat = await fsPromises.stat(filePath);
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      try {
        await fsPromises.access(indexPath);
        return reply.redirect(urlPath + '/');
      } catch {
        return reply.code(404).type('text/html').send('<h1>404 - Page non trouvée</h1>');
      }
    }
  } catch {
    return reply.code(404).type('text/html').send('<h1>404 - Page non trouvée</h1>');
  }

  // Contrôle d'accès
  if (isProtected(urlPath)) {
    const authResult = await verifyUserAuth(request);
    if (!authResult.valid) {
      const cName = getCourseFromUrl(urlPath);
      const courseParam = cName ? '&course=' + encodeURIComponent(cName) : '';
      return reply.redirect('/_auth/activate.html?redirect=' + encodeURIComponent(urlPath) + courseParam);
    }
    if (authResult.scope !== 'all') {
      const allowedCourses = authResult.scope.split(',');
      const courseName = getCourseFromUrl(urlPath);
      if (courseName && !allowedCourses.includes(courseName)) {
        return reply.redirect('/_auth/activate.html?redirect=' + encodeURIComponent(urlPath) + '&course=' + encodeURIComponent(courseName) + '&error=scope');
      }
    }
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (ext === '.html') {
    let content = await fsPromises.readFile(filePath, 'utf-8');
    if (content.includes('</head>')) content = content.replace('</head>', AUTH_INJECT_HEAD + '\n</head>');
    if (content.includes('</body>')) content = content.replace('</body>', AUTH_INJECT_BODY + '\n</body>');
    return reply.type(contentType).send(content);
  }

  const stream = fs.createReadStream(filePath);
  return reply.type(contentType).send(stream);
});

async function start() {
  try {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
    for (const key of required) {
      if (!process.env[key]) { console.error(`❌ Variable manquante : ${key}`); process.exit(1); }
    }
    await initDB();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n🚀 Serveur B1 démarré sur le port ${PORT}`);
    console.log(`📚 Site B1 : http://localhost:${PORT}`);
    console.log(`🔑 Activation : http://localhost:${PORT}/_auth/activate.html`);
    console.log(`⚙️  Admin B1 : http://localhost:${PORT}/_auth/admin/login.html\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
