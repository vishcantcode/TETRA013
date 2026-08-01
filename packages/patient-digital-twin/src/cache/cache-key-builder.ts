/**
 * Standardized Redis Cache Key Builder enforcing consistent key namespaces.
 */
export class CacheKeyBuilder {
  private static readonly PREFIX = 'healthsense:twin';

  public static patientTwinKey(patientId: string): string {
    return `${this.PREFIX}:${patientId}:state`;
  }

  public static vitalCollectionKey(patientId: string): string {
    return `${this.PREFIX}:${patientId}:vitals`;
  }

  public static biomarkerCollectionKey(patientId: string): string {
    return `${this.PREFIX}:${patientId}:biomarkers`;
  }

  public static medicationCollectionKey(patientId: string): string {
    return `${this.PREFIX}:${patientId}:medications`;
  }

  public static riskScoreCollectionKey(patientId: string): string {
    return `${this.PREFIX}:${patientId}:risk`;
  }

  public static lockKey(patientId: string): string {
    return `${this.PREFIX}:${patientId}:lock`;
  }
}
