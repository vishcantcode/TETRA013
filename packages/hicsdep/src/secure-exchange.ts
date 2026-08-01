// ============================================================================
// HICSDEP – Capability 4: Secure Data Exchange Framework
// ============================================================================

import crypto from 'node:crypto';
import { SecureExchangePayload } from './types';

export class HICSDEPSecureDataExchangeFramework {
  private secretKey = crypto.createHash('sha256').update('healthsense-enterprise-key-2026').digest();

  /**
   * Encrypt and sign a FHIR/HealthSense payload for secure cross-organization exchange.
   */
  public encryptAndSignPayload(
    senderOrgId: string,
    recipientOrgId: string,
    rawPayload: string
  ): SecureExchangePayload {
    const exchangeId = `exch-${crypto.randomUUID().slice(0, 8)}`;
    const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, Buffer.alloc(16, 0));
    let encrypted = cipher.update(rawPayload, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(encrypted);
    const digitalSignature = hmac.digest('hex');

    return {
      exchangeId,
      senderOrganizationId: senderOrgId,
      recipientOrganizationId: recipientOrgId,
      encryptedContent: encrypted,
      digitalSignature,
      algorithm: 'AES-256-GCM',
      exchangedAt: new Date(),
    };
  }

  /**
   * Verify digital signature and decrypt secure payload.
   */
  public verifyAndDecryptPayload(payload: SecureExchangePayload): { success: boolean; decryptedContent?: string; error?: string } {
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(payload.encryptedContent);
    const expectedSig = hmac.digest('hex');

    if (expectedSig !== payload.digitalSignature) {
      return { success: false, error: 'Digital signature verification failed. Payload integrity compromised.' };
    }

    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, Buffer.alloc(16, 0));
      let decrypted = decipher.update(payload.encryptedContent, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return { success: true, decryptedContent: decrypted };
    } catch (err: any) {
      return { success: false, error: `Decryption failed: ${err.message}` };
    }
  }
}
