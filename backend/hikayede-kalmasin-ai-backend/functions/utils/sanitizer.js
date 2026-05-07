/**
 * Basic sanitization and validation.
 */
export function sanitizeInput(text) {
  if (!text || typeof text !== 'string') return '';
  
  // Remove potentially dangerous tags/scripts
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .trim();
}

export function validatePayload(body) {
  const { prompt, mode } = body;
  if (!prompt || typeof prompt !== 'string' || prompt.length < 3) {
    return { valid: false, error: 'Geçersiz veya çok kısa girdi metni.' };
  }
  
  const allowedModes = ['analyze', 'chat', 'report'];
  if (mode && !allowedModes.includes(mode)) {
    return { valid: false, error: 'Geçersiz mod.' };
  }
  
  return { valid: true };
}
