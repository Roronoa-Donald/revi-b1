/**
 * Middleware de contrôle d'accès — Bachelor 1
 * Cours B1 : algo, c_cpp, python, reseaux, stats, fbd, merise
 */

const COURSES = {
  'algo': 'Algorithmique',
  'c_cpp': 'C / C++',
  'python': 'Python',
  'reseaux': 'Réseaux Informatiques',
  'stats': 'Statistiques Descriptives',
  'fbd': 'Fondamentaux des Bases de Données',
  'merise': 'MERISE'
};

const COURSE_ICONS = {
  'algo': '🤖',
  'c_cpp': '⚡',
  'python': '🐍',
  'reseaux': '🌐',
  'stats': '📊',
  'fbd': '🔧',
  'merise': '🏗️'
};

const COURSE_THEMES = {
  'algo':    { mode: 'dark',  accent: '#10b981', accentLight: '#34d399', accentDark: '#059669', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  'c_cpp':   { mode: 'dark',  accent: '#f59e0b', accentLight: '#fbbf24', accentDark: '#d97706', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  'python':  { mode: 'dark',  accent: '#06b6d4', accentLight: '#22d3ee', accentDark: '#0891b2', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  'reseaux': { mode: 'dark',  accent: '#0ea5e9', accentLight: '#38bdf8', accentDark: '#0284c7', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
  'stats':   { mode: 'dark',  accent: '#8b5cf6', accentLight: '#a78bfa', accentDark: '#7c3aed', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  'fbd':     { mode: 'dark',  accent: '#ea580c', accentLight: '#f97316', accentDark: '#c2410c', gradient: 'linear-gradient(135deg, #ea580c, #c2410c)' },
  'merise':  { mode: 'dark',  accent: '#14b8a6', accentLight: '#2dd4bf', accentDark: '#0d9488', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' }
};

const COURSE_DIRS = Object.keys(COURSES);

/**
 * Détermine si une URL pointe vers du contenu protégé
 * Seul le chapitre 1 et l'index de chaque cours sont gratuits
 */
function isProtected(urlPath) {
  const cleanUrl = urlPath.split('?')[0].split('#')[0];
  const parts = cleanUrl.split('/').filter(Boolean);

  if (parts.length < 2) return false;

  const courseName = parts[0];
  if (!COURSE_DIRS.includes(courseName)) return false;

  // Assets toujours libres
  if (parts[1] === 'assets') return false;

  // index.html du cours → libre
  if (parts.length === 2 && (parts[1] === 'index.html' || parts[1] === '')) return false;

  // Chapitre 1 → libre
  if (parts[1] === 'chapitres' && parts.length >= 3 && parts[2] === 'chapitre1.html') return false;

  // Seuls les fichiers HTML sont protégés
  if (!cleanUrl.endsWith('.html')) return false;

  return true;
}

/**
 * Extrait le nom du cours depuis l'URL
 */
function getCourseFromUrl(urlPath) {
  const parts = urlPath.split('/').filter(Boolean);
  if (parts.length >= 1 && COURSE_DIRS.includes(parts[0])) {
    return parts[0];
  }
  return null;
}

module.exports = { isProtected, getCourseFromUrl, COURSES, COURSE_ICONS, COURSE_THEMES, COURSE_DIRS };
