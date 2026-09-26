/**
 * Alias generation utilities
 */

export function generateRandomSuffix(len = 6) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let res = '';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) {
    res += chars[bytes[i] % chars.length];
  }
  return res;
}

export function extractSiteTag(urlOrHost) {
  if (!urlOrHost) return '';
  let hostname = urlOrHost;
  try {
    if (urlOrHost.includes(':')) {
      const parsed = new URL(urlOrHost);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      hostname = parsed.hostname;
    }
  } catch {
    if (urlOrHost.includes(':')) {
      return '';
    }
  }

  hostname = hostname.toLowerCase().trim();
  hostname = hostname.replace(/^www\d*\./, '');

  const parts = hostname.split('.').filter(Boolean);
  if (parts.length === 0) return '';

  let tag = '';
  if (parts.length === 1) {
    tag = parts[0];
  } else if (parts.length === 2) {
    tag = parts[0];
  } else {
    const secondLevelTlds = ['co', 'com', 'org', 'net', 'edu', 'gov', 'gouv'];
    if (parts.length >= 3 && secondLevelTlds.includes(parts[parts.length - 2])) {
      tag = parts[parts.length - 3];
    } else {
      tag = parts[parts.length - 2];
    }
  }

  // Nettoyage pour n'accepter que les caractères valides dans un préfixe email
  tag = tag.replace(/[^a-z0-9-]/g, '').slice(0, 15);
  return tag;
}

export function buildAliasAddress(pattern, domain, siteTag = '') {
  const rand = generateRandomSuffix(6);
  const cleanSite = siteTag ? siteTag.trim().toLowerCase() : '';
  let template = pattern && pattern.includes('[rand]') ? pattern : 'shield.[site]-[rand]';

  if (template.includes('[site]')) {
    template = template.replace('[site]', cleanSite);
    template = template.replace(/\.-|-\./g, '-');
    template = template.replace(/\.{2,}/g, '.').replace(/-{2,}/g, '-');
    template = template.replace(/^[-.]+|[-.]+$/g, '');
    if (!template.includes('[rand]')) {
      template += '-[rand]';
    }
  }

  const prefix = template.replace('[rand]', rand);
  return `${prefix}@${domain}`;
}

export function generateUniqueAliasAddress(pattern, domain, existingAliases = [], siteTag = '') {
  const existingSet = new Set(
    (existingAliases || []).map(a => (typeof a === 'string' ? a.toLowerCase() : ''))
  );

  for (let i = 0; i < 10; i++) {
    const candidate = buildAliasAddress(pattern, domain, siteTag);
    if (!existingSet.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return buildAliasAddress(pattern, domain, siteTag);
}

