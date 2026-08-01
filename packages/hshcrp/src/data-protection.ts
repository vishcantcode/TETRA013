// ============================================================================
// HSHCRP – Capability 2: Data Protection Engine
// ============================================================================

import crypto from 'node:crypto';
import { EncryptedPayload, KeyRotationStatus } from './types';

export class HSHCRPDataProtectionEngine {
  private activeKey = 'healthsense_master_kms_key_v1';
  private keyBuffer = crypto.scryptSync(this.activeKey, 'salt', 32);
  private lastRotationAt = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  /**
   * Encrypt sensitive PHI data using AES-256-GCM.
   */
  public encryptPHI(plainText: string): EncryptedPayload {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.keyBuffer, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      cipherText: encrypted,
      algorithm: 'AES-256-GCM',
      iv: iv.toString('hex'),
      authTag,
      encryptedAt: new Date(),
    };
  }

  /**
   * Decrypt sensitive PHI payload.
   */
  public decryptPHI(payload: EncryptedPayload): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.keyBuffer,
      Buffer.from(payload.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

    let decrypted = decipher.update(payload.cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Execute KMS Master Key Rotation.
   */
  public rotateMasterKey(): KeyRotationStatus {
    const newKeyId = `kms-key-${crypto.randomUUID().slice(0, 8)}`;
    this.activeKey = `healthsense_master_${newKeyId}`;
    this.keyBuffer = crypto.scryptSync(this.activeKey, 'salt', 32);
    this.lastRotationAt = new Date();

    return {
      keyId: newKeyId,
      algorithm: 'AES-256-GCM',
      active: true,
      rotatedAt: this.lastRotationAt,
      nextRotationDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };
  }
}
