/**
 * Utilidades para sanitizar y validar inputs
 */

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  
  // Remover caracteres de control y normalizar espacios
  let sanitized = str
    .replace(/[\x00-\x1F\x7F]/g, '') // Remover caracteres de control
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .trim();
  
  // Limitar longitud
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitiza un email
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .substring(0, 100); // Máximo 100 caracteres
}

/**
 * Sanitiza un nombre (solo letras, espacios y caracteres especiales permitidos)
 */
export function sanitizeName(name) {
  if (typeof name !== 'string') return '';
  
  return name
    .trim()
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') // Solo letras y espacios
    .replace(/\s+/g, ' ') // Normalizar espacios
    .substring(0, 50); // Máximo 50 caracteres
}

/**
 * Valida y sanitiza un número
 */
export function sanitizeNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = Number(value);
  if (isNaN(num)) return null;
  return Math.max(min, Math.min(max, num));
}

/**
 * Valida que un string no contenga scripts o código malicioso
 */
export function containsMaliciousCode(str) {
  if (typeof str !== 'string') return false;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers como onclick, onerror, etc.
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(str));
}

