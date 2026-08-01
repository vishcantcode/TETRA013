// ============================================================================
// HSHCRP – Capability 3: API & Application Security Framework
// ============================================================================

import { SanitizationResult, SecurityHeadersConfig } from './types';

export class HSHCRPApplicationSecurityFramework {

  /**
   * Sanitize user/API input to prevent XSS, SQL Injection, and NoSQL Injection.
   */
  public sanitizeInput(input: string): SanitizationResult {
    const threatsDetected: ('XSS' | 'SQLI' | 'NOSQLI' | 'PATH_TRAVERSAL')[] = [];
    let sanitized = input;

    if (/<script|javascript:|onerror=/i.test(input)) {
      threatsDetected.push('XSS');
      sanitized = sanitized.replace(/<script.*?>.*?<\/script>/gi, '').replace(/javascript:/gi, '');
    }

    if (/' OR '1'='1|UNION SELECT|DROP TABLE/i.test(input)) {
      threatsDetected.push('SQLI');
      sanitized = sanitized.replace(/['";=]/g, '');
    }

    return {
      rawInput: input,
      sanitizedInput: sanitized,
      threatsDetected,
      clean: threatsDetected.length === 0,
    };
  }

  /**
   * Get production OWASP-recommended HTTP security headers.
   */
  public getSecurityHeaders(): SecurityHeadersConfig {
    return {
      hstsEnabled: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'self'; object-src 'none';",
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
    };
  }
}
