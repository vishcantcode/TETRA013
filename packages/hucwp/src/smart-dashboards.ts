// ============================================================================
// HUCWP – Capability 5: Smart Dashboard Framework
// ============================================================================

import { DashboardLayout, ClinicianRole, DashboardWidget } from './types';
import { hehcp } from '@healthsense/hehcp';

export class HUCWPSmartDashboardFramework {

  /**
   * Generate customized Smart Dashboard layout based on clinician role and active metrics.
   */
  public generateDashboard(role: ClinicianRole = 'PHYSICIAN'): DashboardLayout {
    const hehcpMetrics = hehcp.getDashboardEngine().getDashboardMetrics();

    const widgets: DashboardWidget[] = [
      {
        widgetId: 'w-1',
        title: 'Active High-Risk Patient Cohort',
        type: 'PATIENT_QUEUE',
        data: [
          { patientId: 'pt-9001', name: 'Johnathan Doe', riskScore: 0.88, condition: 'Decompensated Heart Failure' },
          { patientId: 'pt-9002', name: 'Mary Smith', riskScore: 0.76, condition: 'Uncontrolled Diabetes' },
        ],
      },
      {
        widgetId: 'w-2',
        title: 'Critical Clinical Alerts',
        type: 'ALERT_LIST',
        data: [
          { alertId: 'alt-101', severity: 'HIGH', title: 'BNP 450 pg/mL', patient: 'Johnathan Doe' },
          { alertId: 'alt-102', severity: 'MEDIUM', title: 'HbA1c 7.8%', patient: 'Johnathan Doe' },
        ],
      },
      {
        widgetId: 'w-3',
        title: 'Enterprise Operational Status (HEHCP)',
        type: 'METRIC_CARD',
        data: {
          activeConnectors: hehcpMetrics.activeConnectorsCount,
          eventThroughput: `${hehcpMetrics.eventThroughputPerMinute} ev/min`,
          avgProcessingLatency: `${hehcpMetrics.averageProcessingLatencyMs}ms`,
        },
      },
    ];

    return {
      layoutId: `lyt-${role.toLowerCase()}`,
      role,
      widgets,
    };
  }
}
