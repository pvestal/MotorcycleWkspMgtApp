/**
 * Input sanitization utilities for preventing XSS and injection attacks
 */

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create DOMPurify instance with a virtual DOM
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Configure DOMPurify to be more restrictive
const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'];
const ALLOWED_ATTR = ['href', 'target'];

/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Sanitize HTML content using DOMPurify with restricted tags/attributes
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR
  });
}

/**
 * Recursive function to sanitize all string values in an object
 * @param {*} data - Data to sanitize (object, array, string, etc.)
 * @returns {*} Sanitized data with the same structure
 */
function sanitizeInput(data) {
  // Handle different data types
  if (data === null || data === undefined) {
    return data;
  }
  
  // Sanitize strings
  if (typeof data === 'string') {
    return sanitizeString(data);
  }
  
  // Recursively sanitize arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }
  
  // Recursively sanitize objects
  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize both the key and value
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  // Return numbers, booleans, etc. unchanged
  return data;
}

/**
 * Sanitize a VIN (Vehicle Identification Number)
 * @param {string} vin - Vehicle Identification Number to sanitize
 * @returns {string} Sanitized VIN
 */
function sanitizeVIN(vin) {
  if (typeof vin !== 'string') {
    return vin;
  }
  
  // VIN should be 17 characters, and only contain alphanumeric characters (excluding I, O, Q)
  // Replace invalid characters with empty string
  return vin.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase().substring(0, 17);
}

/**
 * Strip all HTML tags from a string
 * @param {string} input - String to strip HTML from
 * @returns {string} String with all HTML tags removed
 */
function stripHtml(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input.replace(/<\/?[^>]+(>|$)/g, '');
}

module.exports = {
  sanitizeInput,
  sanitizeString,
  sanitizeVIN,
  stripHtml
};