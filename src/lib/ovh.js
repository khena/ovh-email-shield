/**
 * OVH API Client for Firefox WebExtension
 * Implements OVH REST API v1 authentication and email redirection endpoints.
 */

const ENDPOINTS = {
  'ovh-eu': 'https://eu.api.ovh.com/1.0',
  'ovh-ca': 'https://ca.api.ovh.com/1.0',
};

async function sha1Hex(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class OvhClient {
  constructor(config) {
    this.endpoint = ENDPOINTS[config.endpoint] || ENDPOINTS['ovh-eu'];
    this.appKey = config.appKey || '';
    this.appSecret = config.appSecret || '';
    this.consumerKey = config.consumerKey || '';
    this.domain = config.domain || '';
    this.timeDelta = 0;
  }

  isConfigured() {
    return Boolean(this.appKey && this.appSecret && this.consumerKey && this.domain);
  }

  /**
   * Synchronize local clock with OVH server time to prevent clock skew signature errors
   */
  async syncTime() {
    try {
      const res = await fetch(`${this.endpoint}/auth/time`);
      if (res.ok) {
        const serverTime = parseInt(await res.text(), 10);
        const localTime = Math.round(Date.now() / 1000);
        this.timeDelta = serverTime - localTime;
      }
    } catch {
      this.timeDelta = 0;
    }
  }

  /**
   * Compute OVH signature: "$1$" + SHA1_HEX(AS + "+" + CK + "+" + METHOD + "+" + QUERY + "+" + BODY + "+" + TSTAMP)
   */
  async sign(method, url, body = '', timestamp) {
    const toSign = [
      this.appSecret,
      this.consumerKey,
      method.toUpperCase(),
      url,
      body,
      timestamp,
    ].join('+');

    const signature = await sha1Hex(toSign);
    return `$1$${signature}`;
  }

  async request(method, path, body = null) {
    if (!this.isConfigured()) {
      throw new Error('API OVH non configurée. Renseignez vos clés dans les options.');
    }

    const fullUrl = `${this.endpoint}${path}`;
    const timestamp = Math.round(Date.now() / 1000) + this.timeDelta;
    const bodyStr = body ? JSON.stringify(body) : '';
    const signature = await this.sign(method, fullUrl, bodyStr, timestamp);

    const headers = {
      'Content-Type': 'application/json',
      'X-Ovh-Application': this.appKey,
      'X-Ovh-Consumer': this.consumerKey,
      'X-Ovh-Timestamp': timestamp.toString(),
      'X-Ovh-Signature': signature,
    };

    const options = {
      method,
      headers,
    };
    if (bodyStr) {
      options.body = bodyStr;
    }

    const response = await fetch(fullUrl, options);
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const msg = (data && data.message) ? data.message : `Erreur HTTP ${response.status}`;
      throw new Error(msg);
    }

    return data;
  }

  /**
   * Test current credentials against /auth/currentCredential
   */
  async testAuth() {
    await this.syncTime();
    return this.request('GET', '/auth/currentCredential');
  }

  /**
   * List existing email redirections for the domain
   * @param {string|null} fromFilter - Optional filter by source address
   */
  async listRedirections(fromFilter = null) {
    let path = `/email/domain/${encodeURIComponent(this.domain)}/redirection`;
    if (fromFilter) {
      path += `?from=${encodeURIComponent(fromFilter)}`;
    }
    return this.request('GET', path);
  }

  /**
   * Helper to verify if an array of redirection IDs contains one matching target fromEmail
   * @private
   */
  async _matchRedirectionId(ids, targetEmail) {
    if (!Array.isArray(ids) || ids.length === 0) return null;
    for (const id of ids) {
      try {
        const details = await this.getRedirection(id);
        if (details && typeof details.from === 'string' && details.from.toLowerCase().trim() === targetEmail) {
          return String(id);
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  /**
   * Search and return the redirection ID for a given alias email
   */
  async findRedirectionId(fromEmail) {
    if (!fromEmail) return null;
    await this.syncTime();
    const targetEmail = fromEmail.toLowerCase().trim();

    // 1. Try filter with full address
    let ids = await this.listRedirections(fromEmail);
    const verifiedId = await this._matchRedirectionId(ids, targetEmail);
    if (verifiedId) return verifiedId;

    // 2. Try filter with local part if fromEmail has @
    if (fromEmail.includes('@')) {
      const localPart = fromEmail.split('@')[0];
      ids = await this.listRedirections(localPart);
      return this._matchRedirectionId(ids, targetEmail);
    }
    return null;
  }

  /**
   * Wait for OVH background task to finish and resolve the redirection ID
   */
  async waitForRedirectionId(fromEmail, maxAttempts = 4, delayMs = 1500) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const id = await this.findRedirectionId(fromEmail);
      if (id) return id;
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    return null;
  }

  /**
   * Get details of a redirection by ID
   */
  async getRedirection(id) {
    return this.request('GET', `/email/domain/${encodeURIComponent(this.domain)}/redirection/${encodeURIComponent(id)}`);
  }

  /**
   * Create an email redirection on OVH domain
   * @param {string} fromEmail - alias (e.g. shield-x49z@domain.com)
   * @param {string} toEmail - destination address
   * @param {boolean} localCopy - keep local copy or not
   */
  async createRedirection(fromEmail, toEmail, localCopy = false) {
    await this.syncTime();
    return this.request('POST', `/email/domain/${encodeURIComponent(this.domain)}/redirection`, {
      from: fromEmail,
      to: toEmail,
      localCopy,
    });
  }

  /**
   * Delete an email redirection on OVH by ID or fallback to email lookup
   * @param {string|number} id - Redirection ID or 0/pending
   * @param {string|null} fromEmail - Optional alias email for automatic ID resolution
   */
  async deleteRedirection(id, fromEmail = null) {
    await this.syncTime();
    let targetId = id;
    const isInvalidId = !targetId || targetId === '0' || targetId === 0 ||
      String(targetId).startsWith('pending-') || String(targetId).startsWith('local-');

    if (isInvalidId && fromEmail) {
      targetId = await this.findRedirectionId(fromEmail);
    }

    if (!targetId || targetId === '0' || targetId === 0) {
      // Redirection not found on OVH or already deleted
      return { success: true, notFound: true };
    }

    return this.request('DELETE', `/email/domain/${encodeURIComponent(this.domain)}/redirection/${encodeURIComponent(targetId)}`);
  }
}
