import crypto from 'crypto';

/**
 * Generate a unique ID for various entities
 * @returns {string} A random ID of 12 characters
 */
export function generateId() {
  return crypto.randomBytes(8).toString('hex').slice(0, 12);
}

/**
 * Generate a prefix ID (like stripe does)
 * @param {string} prefix - The prefix (e.g., 'sub', 'pay', 'inv')
 * @returns {string} A prefixed ID (e.g., 'sub_abc123def456')
 */
export function generatePrefixedId(prefix) {
  return `${prefix}_${generateId()}`;
}

/**
 * Generate invoice number
 * Format: INV-YYYY-XXXXXX
 * @returns {string} Invoice number
 */
export function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const sequence = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV-${year}-${sequence}`;
}

/**
 * Hash a sensitive string (like API keys)
 * @param {string} value - The value to hash
 * @returns {string} SHA256 hash
 */
export function hashSensitiveData(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export function generateRandomString(length = 32) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export default {
  generateId,
  generatePrefixedId,
  generateInvoiceNumber,
  hashSensitiveData,
  generateRandomString
};
