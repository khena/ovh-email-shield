/**
 * Validation utilities for OVH Email Shield
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const DOMAIN_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

export function isValidDomain(domain) {
  if (typeof domain !== 'string') return false;
  const trimmed = domain.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 253) return false;
  return DOMAIN_REGEX.test(trimmed);
}

export function sanitizeDomain(rawDomain) {
  if (typeof rawDomain !== 'string') return '';
  let domain = rawDomain.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '').replace(/^@/, '').replace(/\/.*$/, '').trim();
  return domain;
}

export function isValidPrefixPattern(pattern) {
  if (typeof pattern !== 'string') return false;
  const trimmed = pattern.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return false;

  // Replace allowed placeholder tokens [site] and [rand] with valid dummy characters
  const simulated = trimmed
    .replace(/\[site\]/g, 'site')
    .replace(/\[rand\]/g, 'rand');

  // Prefix must contain only valid email local-part characters
  if (!/^[a-zA-Z0-9._-]+$/.test(simulated)) {
    return false;
  }
  // Cannot start or end with a dot or have consecutive dots
  if (simulated.startsWith('.') || simulated.endsWith('.') || simulated.includes('..')) {
    return false;
  }

  return true;
}
