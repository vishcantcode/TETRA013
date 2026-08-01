// ============================================================================
// HLEMP – Capability 4: HL7 Message Validation Framework
// ============================================================================

import { HL7ParsedMessage, HL7ValidationReport, HL7ValidationError } from './types';

export class HLEMPHL7ValidatorEngine {

  public validate(parsed: HL7ParsedMessage): HL7ValidationReport {
    const errors: HL7ValidationError[] = [];
    const warnings: HL7ValidationError[] = [];

    // Rule 1: MSH presence check
    const msh = parsed.segments.find(s => s.name === 'MSH');
    if (!msh) {
      errors.push({
        segmentName: 'MSH',
        fieldIndex: 0,
        message: 'MSH segment is missing.',
        severity: 'ERROR',
      });
    }

    // Rule 2: Control ID check
    if (!parsed.controlId) {
      errors.push({
        segmentName: 'MSH',
        fieldIndex: 10,
        message: 'Control ID (MSH-10) is missing.',
        severity: 'ERROR',
      });
    }

    // Rule 3: Version check
    if (!['2.3', '2.4', '2.5', '2.6'].includes(parsed.version)) {
      warnings.push({
        segmentName: 'MSH',
        fieldIndex: 12,
        message: `Non-standard HL7 version detected: ${parsed.version}`,
        severity: 'WARNING',
      });
    }

    // Rule 4: ADT / ORU required segments
    if (parsed.messageType === 'ADT') {
      const pid = parsed.segments.find(s => s.name === 'PID');
      if (!pid) {
        errors.push({
          segmentName: 'PID',
          fieldIndex: 0,
          message: 'ADT message requires PID segment.',
          severity: 'ERROR',
        });
      }
    }

    if (parsed.messageType === 'ORU') {
      const obx = parsed.segments.find(s => s.name === 'OBX');
      if (!obx) {
        warnings.push({
          segmentName: 'OBX',
          fieldIndex: 0,
          message: 'ORU message contains no OBX observation segments.',
          severity: 'WARNING',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      messageType: parsed.messageType,
      controlId: parsed.controlId,
      errors,
      warnings,
    };
  }
}
