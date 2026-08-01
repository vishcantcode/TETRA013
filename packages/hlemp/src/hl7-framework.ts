// ============================================================================
// HLEMP – Capability 1: HL7 v2 Message Framework
// ============================================================================

import {
  HL7MessageType,
  HL7Segment,
  HL7ParsedMessage,
  HL7AckMessage,
  HL7AckCode,
} from './types';

export class HLEMPHL7Framework {
  /**
   * Parse a raw pipe-delimited HL7 v2 message string into structured segments.
   */
  public parse(rawMessage: string): HL7ParsedMessage {
    const lines = rawMessage.trim().split(/\r?\n|\r/);
    if (lines.length === 0 || !lines[0].startsWith('MSH')) {
      throw new Error('Malformed HL7 message: Header segment MSH is missing.');
    }

    const segments: HL7Segment[] = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split('|');
      const name = parts[0];
      const fields = name === 'MSH' ? ['|', ...parts.slice(1)] : parts.slice(1);
      segments.push({ name, fields });
    }

    const msh = segments.find(s => s.name === 'MSH');
    if (!msh) throw new Error('MSH segment missing');

    const sendingApp = msh.fields[2] || 'UNKNOWN_APP';
    const sendingFac = msh.fields[3] || 'UNKNOWN_FAC';
    const receivingApp = msh.fields[4] || 'UNKNOWN_APP';
    const receivingFac = msh.fields[5] || 'UNKNOWN_FAC';
    const timestamp = msh.fields[6] || new Date().toISOString();
    const messageTypeField = msh.fields[8] || 'ADT^A01';
    const [msgTypeStr, triggerEventStr] = messageTypeField.split('^');
    const controlId = msh.fields[9] || `ctrl-${Date.now()}`;
    const version = msh.fields[11] || '2.5';

    return {
      rawMessage,
      messageType: (msgTypeStr || 'ADT') as HL7MessageType,
      triggerEvent: triggerEventStr || 'A01',
      controlId,
      version,
      sendingApplication: sendingApp,
      sendingFacility: sendingFac,
      receivingApplication: receivingApp,
      receivingFacility: receivingFac,
      timestamp,
      segments,
    };
  }

  /**
   * Generate an HL7 ACK response (Application Accept / Error / Reject).
   */
  public generateAck(parsed: HL7ParsedMessage, ackCode: HL7AckCode = 'AA', textMessage = 'Message accepted successfully'): HL7AckMessage {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const mshSegment = `MSH|^~\\&|HealthSense|HOSPITAL|${parsed.sendingApplication}|${parsed.sendingFacility}|${timestamp}||ACK^${parsed.triggerEvent}|ack-${parsed.controlId}|P|${parsed.version}`;
    const msaSegment = `MSA|${ackCode}|${parsed.controlId}|${textMessage}`;

    const rawAck = `${mshSegment}\r${msaSegment}\r`;

    return {
      ackCode,
      textMessage,
      controlId: parsed.controlId,
      rawAck,
    };
  }

  /**
   * Serialize a structured parsed message back into standard pipe-delimited HL7 string.
   */
  public generate(parsed: HL7ParsedMessage): string {
    const lines: string[] = [];
    for (const seg of parsed.segments) {
      if (seg.name === 'MSH') {
        lines.push(`MSH|${seg.fields.slice(1).join('|')}`);
      } else {
        lines.push(`${seg.name}|${seg.fields.join('|')}`);
      }
    }
    return lines.join('\r') + '\r';
  }
}
