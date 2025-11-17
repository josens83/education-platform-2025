/**
 * HTML Sanitization utility
 * Provides safe HTML rendering to prevent XSS attacks
 */

/**
 * Basic HTML entity encoding
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize HTML content for safe rendering
 * Allows only safe HTML tags and attributes
 */
export function sanitizeHtml(html: string): string {
  // List of allowed tags (whitelist approach)
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span'
  ];

  // List of allowed attributes
  const allowedAttributes: Record<string, string[]> = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id']  // Allowed for all tags
  };

  // Create a temporary element to parse HTML
  const div = document.createElement('div');
  div.innerHTML = html;

  // Recursive function to clean nodes
  function cleanNode(node: Node): Node | null {
    // Text nodes are safe
    if (node.nodeType === Node.TEXT_NODE) {
      return node;
    }

    // Only process element nodes
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // Remove disallowed tags
    if (!allowedTags.includes(tagName)) {
      return null;
    }

    // Clean attributes
    const cleanElement = document.createElement(tagName);
    const tagAllowedAttrs = [
      ...(allowedAttributes[tagName] || []),
      ...(allowedAttributes['*'] || [])
    ];

    Array.from(element.attributes).forEach(attr => {
      if (tagAllowedAttrs.includes(attr.name.toLowerCase())) {
        // Additional sanitization for href to prevent javascript: URLs
        if (attr.name === 'href') {
          const value = attr.value.trim().toLowerCase();
          if (value.startsWith('javascript:') || value.startsWith('data:')) {
            return; // Skip dangerous URLs
          }
        }
        cleanElement.setAttribute(attr.name, attr.value);
      }
    });

    // Recursively clean children
    Array.from(element.childNodes).forEach(child => {
      const cleanChild = cleanNode(child);
      if (cleanChild) {
        cleanElement.appendChild(cleanChild);
      }
    });

    return cleanElement;
  }

  // Clean all child nodes
  const cleanDiv = document.createElement('div');
  Array.from(div.childNodes).forEach(child => {
    const cleanChild = cleanNode(child);
    if (cleanChild) {
      cleanDiv.appendChild(cleanChild);
    }
  });

  return cleanDiv.innerHTML;
}

/**
 * Sanitize user input (removes all HTML)
 * Use this for user-generated content that shouldn't contain HTML
 */
export function sanitizeInput(input: string): string {
  return escapeHtml(input.trim());
}

/**
 * Validate and sanitize URL
 * Ensures URL is safe and properly formatted
 */
export function sanitizeUrl(url: string): string {
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
