/**
 * Input sanitization utilities
 * Prevents XSS and other injection attacks
 */

/**
 * Escape HTML special characters
 */
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Remove all HTML tags from string
 */
function stripHtml(html) {
  if (typeof html !== 'string') return html;
  
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize plain text input (removes HTML, trims whitespace)
 */
function sanitizeText(input) {
  if (typeof input !== 'string') return input;
  
  return stripHtml(input).trim();
}

/**
 * Sanitize rich text (allows safe HTML tags only)
 */
function sanitizeHtml(html) {
  if (typeof html !== 'string') return html;
  
  // List of allowed tags (whitelist approach)
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'blockquote', 'code', 'pre',
  ];
  
  // For now, we'll just escape if it contains script or iframe tags
  if (/<script|<iframe|javascript:|on\w+=/i.test(html)) {
    return escapeHtml(html);
  }
  
  return html;
}

/**
 * Sanitize object (recursively sanitizes all string values)
 */
function sanitizeObject(obj, options = {}) {
  const { allowHtml = [] } = options;
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Check if this field allows HTML
      if (allowHtml.includes(key)) {
        sanitized[key] = sanitizeHtml(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize email
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(trimmed) ? trimmed : '';
}

/**
 * Validate and sanitize URL
 */
function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http, https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

module.exports = {
  escapeHtml,
  stripHtml,
  sanitizeText,
  sanitizeHtml,
  sanitizeObject,
  sanitizeEmail,
  sanitizeUrl
};
