const crypto = require('crypto');

/**
 * Génère une clé d'activation au format XXXX-XXXX
 * Mélange de caractères alphanumériques aléatoires et de timestamp
 */
function generateActivationKey() {
  // Caractères non ambigus (exclusion de 0/O, 1/I/l)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  // Composante timestamp en base36
  const timestampPart = Date.now().toString(36).toUpperCase();

  let key = '';
  for (let i = 0; i < 8; i++) {
    // Positions 1 et 5 : caractères dérivés du timestamp
    if (i === 1 || i === 5) {
      const tsChar = timestampPart[(i + 3) % timestampPart.length];
      // S'assurer que le caractère est dans l'ensemble autorisé
      if (chars.includes(tsChar)) {
        key += tsChar;
      } else {
        key += chars[parseInt(tsChar, 36) % chars.length];
      }
    } else {
      const randomByte = crypto.randomBytes(1)[0];
      key += chars[randomByte % chars.length];
    }
  }

  return key.substring(0, 4) + '-' + key.substring(4, 8);
}

/**
 * Génère un identifiant unique pour les sessions JWT (jti)
 */
function generateJti() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash un fingerprint pour stockage sécurisé
 */
function hashFingerprint(fingerprint) {
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

module.exports = { generateActivationKey, generateJti, hashFingerprint };
