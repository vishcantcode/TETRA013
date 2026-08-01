import { TwinVersionSnapshot } from '../interfaces/TwinVersion';

export class VersionManager {
  public static createVersionSnapshot(
    versionNumber: number,
    tag: TwinVersionSnapshot['versionTag'],
    eventText: string,
    deltas: string[]
  ): TwinVersionSnapshot {
    return {
      version: `v${versionNumber}.0`,
      versionTag: tag,
      createdAt: new Date().toISOString(),
      triggeredEvent: eventText,
      deltaSummary: deltas
    };
  }

  public static getInitialVersionHistory(): TwinVersionSnapshot[] {
    return [
      {
        version: 'v1.0',
        versionTag: 'v1 Registration',
        createdAt: '2025-07-20T09:00:00Z',
        triggeredEvent: 'Initial Patient Registration & Baseline Data Entry',
        deltaSummary: ['Initial demographic registration', 'Baseline vitals recorded']
      },
      {
        version: 'v2.0',
        versionTag: 'v2 Lab Upload',
        createdAt: '2026-07-25T08:15:00Z',
        triggeredEvent: 'Laboratory Panel OCR Extraction Ingested',
        deltaSummary: ['HbA1c & Fasting Glucose updated', 'eGFR & UACR panel attached']
      }
    ];
  }
}
