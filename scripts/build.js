#!/usr/bin/env node
/**
 * Script de build pour Vercel — Bachelor 1
 * 
 * 1. Copie tous les cours B1 dans dist/
 * 2. Injecte les scripts d'authentification dans chaque HTML
 * 3. Copie public/ → dist/_auth/
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Cours B1
const COURSE_DIRS = ['algo', 'c_cpp', 'python', 'reseaux', 'stats', 'fbd', 'merise', 'algebre', 'ato'];

// Dossiers partagés à copier en plus des cours
const SHARED_DIRS = ['assets'];

// Fichiers racine
const ROOT_FILES = ['index.html', 'dashboard.html', 'robots.txt', 'sitemap.xml', '404.html', 'rd-ai-chat.js'];

// Dossiers à ignorer
const SKIP_DIRS = ['node_modules', '.git', 'server', 'api', 'scripts', 'dist', 'public', 'cours', 'ref'];

// Injection HTML
const ANTI_FLASH_SCRIPT = `<script>(function(){var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');document.documentElement.classList.add('dark');document.body&&document.body.classList.add('dark-mode');}})();</script>`;
const MATHJAX_SCRIPT = `<script>MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]}}</script><script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>`;
const AUTH_INJECT_HEAD = ANTI_FLASH_SCRIPT + '\n<link rel="stylesheet" href="/_auth/css/auth-styles.css">';
const AUTH_INJECT_BODY = '<script src="/_auth/js/fingerprint.js"></script>\n<script src="/_auth/js/auth-check.js"></script>\n<script src="/rd-ai-chat.js"></script>';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.includes(entry.name)) continue;
      copyDirRecursive(srcPath, destPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.pdf', '.docx', '.doc', '.py'].includes(ext)) continue;
      if (ext === '.txt' && !entry.name.includes('robots')) continue;

      if (ext === '.html') {
        let content = fs.readFileSync(srcPath, 'utf-8');
        content = injectAuth(content, srcPath);
        fs.writeFileSync(destPath, content, 'utf-8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function injectAuth(html, filePath) {
  const needsMathJax = filePath && filePath.replace(/\\/g, '/').includes('/stats/');
  const headInject = needsMathJax ? AUTH_INJECT_HEAD + '\n' + MATHJAX_SCRIPT : AUTH_INJECT_HEAD;
  if (html.includes('</head>')) html = html.replace('</head>', headInject + '\n</head>');
  if (html.includes('</body>')) html = html.replace('</body>', AUTH_INJECT_BODY + '\n</body>');
  return html;
}

function copyFileIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const ext = path.extname(src).toLowerCase();
    if (ext === '.html') {
      let content = fs.readFileSync(src, 'utf-8');
      content = injectAuth(content, src);
      fs.writeFileSync(dest, content, 'utf-8');
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

function countFiles(dir) {
  let total = 0, html = 0;
  if (!fs.existsSync(dir)) return { total, html };
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const sub = countFiles(path.join(dir, entry.name));
      total += sub.total; html += sub.html;
    } else {
      total++;
      if (entry.name.endsWith('.html')) html++;
    }
  }
  return { total, html };
}

// ========================
// Build
// ========================

console.log('🔨 Build B1 démarré...\n');
const startTime = Date.now();

try { if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true }); }
catch (e) { console.log('  ⚠️ Nettoyage partiel :', e.message); }
fs.mkdirSync(DIST, { recursive: true });
console.log('  ✅ dist/ prêt');

let htmlCount = 0, fileCount = 0;

for (const courseDir of COURSE_DIRS) {
  const src = path.join(ROOT, courseDir);
  if (fs.existsSync(src)) {
    copyDirRecursive(src, path.join(DIST, courseDir));
    const count = countFiles(path.join(DIST, courseDir));
    fileCount += count.total; htmlCount += count.html;
    console.log(`  📚 ${courseDir}/ → ${count.total} fichiers (${count.html} HTML)`);
  }
}

// Copier les dossiers partagés (assets/)
for (const sharedDir of SHARED_DIRS) {
  const src = path.join(ROOT, sharedDir);
  if (fs.existsSync(src)) {
    copyDirRecursive(src, path.join(DIST, sharedDir));
    const count = countFiles(path.join(DIST, sharedDir));
    fileCount += count.total;
    console.log(`  🎨 ${sharedDir}/ → ${count.total} fichiers (partagés)`);
  }
}

for (const file of ROOT_FILES) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    copyFileIfExists(src, path.join(DIST, file));
    fileCount++;
    if (file.endsWith('.html')) htmlCount++;
    console.log(`  📄 ${file}`);
  }
}

if (fs.existsSync(PUBLIC_DIR)) {
  copyDirRecursive(PUBLIC_DIR, path.join(DIST, '_auth'));
  const authCount = countFiles(path.join(DIST, '_auth'));
  fileCount += authCount.total;
  console.log(`  🔑 _auth/ → ${authCount.total} fichiers`);
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`\n✨ Build B1 terminé en ${elapsed}s`);
console.log(`   ${fileCount} fichiers copiés, ${htmlCount} HTML avec auth injectée`);
console.log(`   Sortie : dist/\n`);
