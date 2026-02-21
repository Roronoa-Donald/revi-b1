/**
 * Script de vérification d'authentification — Bachelor 1
 * Injecté dans toutes les pages HTML du site B1
 */
(function() {
  'use strict';

  if (window.location.pathname.startsWith('/_auth/')) return;

  var COURSE_DIRS = ['algo', 'c_cpp', 'python', 'reseaux', 'stats', 'fbd', 'merise', 'algebre', 'ato'];
  var path = window.location.pathname;

  function isProtectedPage() {
    var cleanUrl = path.split('?')[0].split('#')[0];
    var parts = cleanUrl.split('/').filter(Boolean);
    if (parts.length < 2) return false;
    var courseName = parts[0];
    if (COURSE_DIRS.indexOf(courseName) === -1) return false;
    if (parts[1] === 'assets') return false;
    if (parts.length === 2 && (parts[1] === 'index.html' || parts[1] === '')) return false;
    if (parts[1] === 'chapitres' && parts.length >= 3 && parts[2] === 'chapitre1.html') return false;
    if (!cleanUrl.endsWith('.html')) return false;
    return true;
  }

  function getCourseFromPath() {
    var parts = path.split('/').filter(Boolean);
    if (parts.length >= 1 && COURSE_DIRS.indexOf(parts[0]) !== -1) return parts[0];
    return null;
  }

  var protectedPage = isProtectedPage();
  var currentCourse = getCourseFromPath();

  if (protectedPage) {
    document.documentElement.classList.add('auth-content-hidden');
  }

  fetch('/api/verify', { credentials: 'include' })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.authenticated) {
        var hasAccess = data.scope === 'all' ||
          (currentCourse && data.scope && data.scope.split(',').indexOf(currentCourse) !== -1);

        if (protectedPage && !hasAccess) {
          showBlockingOverlay('scope');
        } else {
          document.documentElement.classList.remove('auth-content-hidden');
          showAuthBadge(data.scope);
          addLogoutButton();
        }
      } else {
        if (protectedPage) {
          showBlockingOverlay('auth');
        } else {
          showDemoBanner();
        }
      }
    })
    .catch(function() {
      if (protectedPage) {
        showBlockingOverlay('auth');
      } else {
        showDemoBanner();
      }
    });

  function showBlockingOverlay(reason) {
    document.documentElement.classList.add('auth-content-hidden');
    var courseParam = currentCourse ? '&course=' + encodeURIComponent(currentCourse) : '';
    var redirectParam = encodeURIComponent(path);

    var title, message;
    if (reason === 'scope') {
      title = 'Acc\u00e8s non inclus dans votre licence';
      message = 'Votre cl\u00e9 d\'activation ne couvre pas ce cours. Contactez votre administrateur ou activez une cl\u00e9 valide pour ce module.';
    } else {
      title = 'Contenu r\u00e9serv\u00e9 aux abonn\u00e9s';
      message = 'Ce chapitre n\u00e9cessite une cl\u00e9 d\'activation. Obtenez votre acc\u00e8s complet pour seulement <strong>1 000 F</strong> ! Contactez Donald pour votre cl\u00e9.';
    }

    var overlay = document.createElement('div');
    overlay.id = 'auth-blocking-overlay';
    overlay.innerHTML =
      '<div class="auth-block-card">' +
        '<div class="auth-block-icon">\uD83D\uDD12</div>' +
        '<h2 class="auth-block-title">' + title + '</h2>' +
        '<p class="auth-block-message">' + message + '</p>' +
        '<div class="auth-block-actions">' +
          '<a href="/_auth/activate.html?redirect=' + redirectParam + courseParam + '" class="auth-block-btn auth-block-btn-primary">' +
            '\uD83D\uDD11 Activer une cl\u00e9 d\'acc\u00e8s' +
          '</a>' +
          '<a href="/' + (currentCourse || '') + '/index.html" class="auth-block-btn auth-block-btn-secondary">' +
            '\u2190 Retour au sommaire' +
          '</a>' +
        '</div>' +
        '<p class="auth-block-hint">Vous avez d\u00e9j\u00e0 une cl\u00e9 ? <a href="/_auth/activate.html?redirect=' + redirectParam + courseParam + '">Cliquez ici pour l\'activer</a></p>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function showAuthBadge(scope) {
    var badge = document.createElement('div');
    badge.id = 'auth-badge';
    var scopeText = 'Acc\u00e8s complet';
    if (scope !== 'all') scopeText = 'Acc\u00e8s : ' + scope.split(',').join(', ');
    badge.innerHTML = '<span class="auth-badge-dot"></span><span>' + scopeText + '</span>';
    document.body.appendChild(badge);
  }

  function addLogoutButton() {
    var badge = document.getElementById('auth-badge');
    if (!badge) return;
    var logoutBtn = document.createElement('button');
    logoutBtn.id = 'auth-logout-btn';
    logoutBtn.textContent = '\u2715';
    logoutBtn.title = 'Se d\u00e9connecter';
    logoutBtn.addEventListener('click', function() {
      if (confirm('Voulez-vous vous d\u00e9connecter ?')) {
        fetch('/api/logout', { method: 'POST', credentials: 'include' })
          .then(function() { window.location.reload(); });
      }
    });
    badge.appendChild(logoutBtn);
  }

  function showDemoBanner() {
    var coursePattern = /^\/(algo|c_cpp|python|reseaux|stats|fbd|merise)\//;
    var courseMatch = path.match(coursePattern);
    if (!courseMatch && path !== '/' && !path.endsWith('/index.html')) return;
    var courseParam = courseMatch ? '&course=' + encodeURIComponent(courseMatch[1]) : '';
    var banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.innerHTML =
      '<div class="demo-banner-content">' +
        '<span class="demo-banner-icon">\uD83D\uDD12</span>' +
        '<span class="demo-banner-text">' +
          '<strong>Mode d\u00e9monstration</strong> \u2014 Acc\u00e8s complet \u00e0 <strong>1 000 F</strong> seulement ! ' +
          '<a href="/_auth/activate.html?redirect=' + encodeURIComponent(path) + courseParam + '" class="demo-banner-link">' +
            'Activer une cl\u00e9 d\'acc\u00e8s \u2192' +
          '</a>' +
        '</span>' +
        '<button class="demo-banner-close" onclick="this.parentElement.parentElement.remove()" title="Fermer">\u2715</button>' +
      '</div>';
    document.body.prepend(banner);
  }
})();
