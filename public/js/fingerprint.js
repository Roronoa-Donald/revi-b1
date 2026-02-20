/**
 * Génération de fingerprint navigateur
 * Combine plusieurs propriétés du navigateur pour créer une empreinte unique
 */
function generateFingerprint() {
  const components = [];

  // User Agent
  components.push(navigator.userAgent || '');

  // Langue
  components.push(navigator.language || '');

  // Langues
  components.push((navigator.languages || []).join(','));

  // Plateforme
  components.push(navigator.platform || '');

  // Résolution d'écran
  components.push(screen.width + 'x' + screen.height);
  components.push(screen.colorDepth || '');

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
  components.push(new Date().getTimezoneOffset().toString());

  // Nombre de coeurs CPU
  components.push(navigator.hardwareConcurrency || '');

  // Mémoire (si disponible)
  components.push(navigator.deviceMemory || '');

  // Touch support
  components.push(navigator.maxTouchPoints || 0);

  // WebGL Renderer (si disponible)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '');
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
      }
    }
  } catch (e) {
    components.push('no-webgl');
  }

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Fingerprint!', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Fingerprint!', 4, 17);
    components.push(canvas.toDataURL());
  } catch (e) {
    components.push('no-canvas');
  }

  // Générer un hash simple mais déterministe
  const raw = components.join('|||');
  return simpleHash(raw);
}

/**
 * Hash simple et déterministe pour le fingerprint
 * Utilise un algorithme djb2 modifié pour produire un hash hex
 */
function simpleHash(str) {
  let hash1 = 5381;
  let hash2 = 52711;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1 + char) >>> 0;
    hash2 = ((hash2 << 5) + hash2 + char) >>> 0;
  }

  // Combiner les deux hash en hex pour plus d'unicité
  const part1 = hash1.toString(16).padStart(8, '0');
  const part2 = hash2.toString(16).padStart(8, '0');

  // Ajouter un troisième composant
  let hash3 = 0;
  for (let i = 0; i < str.length; i++) {
    hash3 = str.charCodeAt(i) + ((hash3 << 6) + (hash3 << 16) - hash3);
    hash3 = hash3 >>> 0;
  }
  const part3 = hash3.toString(16).padStart(8, '0');

  return part1 + part2 + part3;
}

// Rendre disponible globalement
if (typeof window !== 'undefined') {
  window.generateFingerprint = generateFingerprint;
}
