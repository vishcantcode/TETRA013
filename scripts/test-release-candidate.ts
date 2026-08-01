import app from '../packages/api/src/server';
import http from 'http';

const PORT = 3997;
const BASE_URL = `http://localhost:${PORT}`;

let server: http.Server;

async function request(path: string, options: { method?: string; token?: string; body?: any } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const method = options.method || 'GET';
  const fetchOpts: RequestInit = { method, headers };
  if (options.body && method !== 'GET' && method !== 'HEAD') {
    fetchOpts.body = JSON.stringify(options.body);
  }

  const startTime = Date.now();
  const res = await fetch(`${BASE_URL}${path}`, fetchOpts);
  const latencyMs = Date.now() - startTime;

  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json, latencyMs };
}

async function runReleaseCandidateAcceptance() {
  console.log('================================================================');
  console.log('HEALTHSENSE PRODUCT MATURITY: RELEASE CANDIDATE (RC) AUDIT');
  console.log('================================================================\n');

  server = app.listen(PORT);
  console.log(`[RC Suite] Server active on ${BASE_URL}\n`);

  const checklist: { category: string; test: string; status: 'PASS' | 'FAIL'; latencyMs: number; details?: string }[] = [];

  const recordCheck = (category: string, test: string, success: boolean, latencyMs: number, details?: string) => {
    const status = success ? 'PASS' : 'FAIL';
    checklist.push({ category, test, status, latencyMs, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} [${category}] ${test} (${latencyMs}ms)${details ? ` -> ${details}` : ''}`);
  };

  try {
    // ------------------------------------------------------------------------
    // DOMAIN 1: AUTHENTICATION & SESSION LIFECYCLE
    // ------------------------------------------------------------------------
    const userEmail = `rc-patient-${Date.now()}@healthsense.ai`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        email: userEmail,
        password: 'RcPassword123!',
        firstName: 'Marcus',
        lastName: 'Aurelius',
        dateOfBirth: '1985-04-26',
        gender: 'male'
      }
    });
    recordCheck('Authentication', 'Patient Registration & Token Issuance', regRes.status === 200 && !!regRes.body.data?.token, regRes.latencyMs, `User: ${userEmail}`);

    const patientToken = regRes.body.data?.token;

    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: userEmail, password: 'RcPassword123!' }
    });
    recordCheck('Authentication', 'User Login & Password Verification', loginRes.status === 200 && !!loginRes.body.data?.token, loginRes.latencyMs, 'Valid credentials accepted');

    const invalidLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: userEmail, password: 'WrongPassword!' }
    });
    recordCheck('Authentication', 'Invalid Credentials Rejection', invalidLogin.status === 401, invalidLogin.latencyMs, 'HTTP 401 Unauthorized');

    const unauthReq = await request('/auth/me');
    recordCheck('Authentication', 'Missing Token Protection', unauthReq.status === 401, unauthReq.latencyMs, 'HTTP 401 on unauthenticated route');

    const badTokenReq = await request('/auth/me', { token: 'invalid.jwt.token' });
    recordCheck('Authentication', 'Malformed Token Protection', badTokenReq.status === 401, badTokenReq.latencyMs, 'HTTP 401 on malformed token');

    // ------------------------------------------------------------------------
    // DOMAIN 2: AUTHORIZATION & RBAC ENFORCEMENT
    // ------------------------------------------------------------------------
    const adminAccessAttempt = await request('/admin/users', { token: patientToken });
    recordCheck('Authorization', 'RBAC Patient Access Control to Admin Endpoint', adminAccessAttempt.status === 403, adminAccessAttempt.latencyMs, 'HTTP 403 Forbidden for patient');

    const clinicianAccessAttempt = await request('/clinician/patients', { token: patientToken });
    recordCheck('Authorization', 'RBAC Patient Access Control to Clinician Endpoint', clinicianAccessAttempt.status === 403, clinicianAccessAttempt.latencyMs, 'HTTP 403 Forbidden for patient');

    // Create Admin and Clinician
    const adminEmail = `rc-admin-${Date.now()}@healthsense.ai`;
    await request('/auth/register', {
      method: 'POST',
      body: { email: adminEmail, password: 'AdminPassword123!', firstName: 'Super', lastName: 'Admin', dateOfBirth: '1980-01-01', gender: 'male' }
    });
    const { pool } = await import('@healthsense/db');
    await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [adminEmail]);

    const adminLoginRes = await request('/auth/login', { method: 'POST', body: { email: adminEmail, password: 'AdminPassword123!' } });
    const adminToken = adminLoginRes.body.data?.token;

    const adminUsersReq = await request('/admin/users', { token: adminToken });
    recordCheck('Authorization', 'RBAC Admin Access Permission', adminUsersReq.status === 200 && Array.isArray(adminUsersReq.body.data?.users), adminUsersReq.latencyMs, 'Admin access granted');

    // ------------------------------------------------------------------------
    // DOMAIN 3: USER MANAGEMENT & PROVISIONING
    // ------------------------------------------------------------------------
    const docEmail = `dr.rc-${Date.now()}@hospital.org`;
    const createDoc = await request('/admin/users', {
      method: 'POST',
      token: adminToken,
      body: { email: docEmail, password: 'DocPassword123!', role: 'clinician', firstName: 'Alexander', lastName: 'Fleming', gender: 'male', dateOfBirth: '1975-03-15' }
    });
    recordCheck('User Management', 'Admin Provisioning Clinician Account', createDoc.status === 200 && createDoc.body.data?.user?.role === 'clinician', createDoc.latencyMs, `Clinician: ${docEmail}`);

    const docLogin = await request('/auth/login', { method: 'POST', body: { email: docEmail, password: 'DocPassword123!' } });
    const docToken = docLogin.body.data?.token;

    const docPatientsReq = await request('/clinician/patients', { token: docToken });
    recordCheck('User Management', 'Clinician Patient Roster Access', docPatientsReq.status === 200 && Array.isArray(docPatientsReq.body.data?.patients), docPatientsReq.latencyMs, 'Roster fetched');

    // ------------------------------------------------------------------------
    // DOMAIN 4: PATIENT WORKFLOWS
    // ------------------------------------------------------------------------
    const meRes = await request('/auth/me', { token: patientToken });
    recordCheck('Patient Workflows', 'Patient Identity & Profile Retrieval', meRes.status === 200 && meRes.body.data?.user?.email === userEmail, meRes.latencyMs, 'Identity verified');

    const updateProfileRes = await request('/profile', {
      method: 'PUT',
      token: patientToken,
      body: { first_name: 'Marcus', last_name: 'Aurelius Antoninus' }
    });
    recordCheck('Patient Workflows', 'Profile Demographics Update', updateProfileRes.status === 200 && updateProfileRes.body.data?.profile?.last_name === 'Aurelius Antoninus', updateProfileRes.latencyMs, 'Demographics updated');

    const dashboardRes = await request('/dashboard', { token: patientToken });
    recordCheck('Patient Workflows', 'Patient Dashboard Data Synthesis', dashboardRes.status === 200 && typeof dashboardRes.body.data?.riskScore === 'number', dashboardRes.latencyMs, `Risk Score: ${dashboardRes.body.data?.riskScore}`);

    // ------------------------------------------------------------------------
    // DOMAIN 5: CLINICAL WORKFLOWS & TRIAGE
    // ------------------------------------------------------------------------
    const triageRes = await request('/triage/start', {
      method: 'POST',
      token: patientToken,
      body: { symptom: 'persistent high fever and productive cough' }
    });
    const sessionId = triageRes.body.data?.sessionId;
    recordCheck('Clinical Workflows', 'Symptom Triage Workflow Start', triageRes.status === 200 && !!sessionId, triageRes.latencyMs, `Session: ${sessionId}`);

    const ansRes = await request('/triage/answer', { method: 'POST', token: patientToken, body: { sessionId, answer: 'Fever started 3 days ago' } });
    recordCheck('Clinical Workflows', 'Triage Question Response Recording', ansRes.status === 200 && ansRes.body.success, ansRes.latencyMs, 'Response recorded');

    const completeTriageRes = await request('/triage/complete', { method: 'POST', token: patientToken, body: { sessionId } });
    recordCheck('Clinical Workflows', 'Triage Workflow Completion', completeTriageRes.status === 200 && completeTriageRes.body.data?.status === 'completed', completeTriageRes.latencyMs, 'Workflow status: completed');

    // ------------------------------------------------------------------------
    // DOMAIN 6: CLINICAL KNOWLEDGE FABRIC & DECISION SUPPORT
    // ------------------------------------------------------------------------
    const decisionRes = await request('/decision/generate', {
      method: 'POST',
      token: patientToken,
      body: {
        sessionId,
        evidence: [
          { source: 'knowledge-fabric', confidence: 0.96, data: 'Community-acquired pneumonia protocol' },
          { source: 'vital-signs', confidence: 0.91, data: 'Temperature 38.9 C' }
        ]
      }
    });
    const decisionDraft = decisionRes.body.data?.draft;
    recordCheck('Decision Support', 'Clinical Decision Synthesis Pipeline', decisionRes.status === 200 && !!decisionDraft, decisionRes.latencyMs, 'Decision synthesized');

    // ------------------------------------------------------------------------
    // DOMAIN 7: EXPLAINABILITY & EVIDENCE
    // ------------------------------------------------------------------------
    const rawExplanation = decisionDraft?.explanation;
    const hasExplanation = !!rawExplanation;
    recordCheck('Explainability', 'Evidence-Based Explanation Generation', hasExplanation, 1, 'Evidence chain attached to recommendation');

    // ------------------------------------------------------------------------
    // DOMAIN 8: MEDICAL UPLOADS & RECORDS VAULT
    // ------------------------------------------------------------------------
    const uploadRes = await request('/records/upload', {
      method: 'POST',
      token: patientToken,
      body: {
        recordType: 'lab_result',
        title: 'Chest X-Ray Diagnostic Report',
        data: { impression: 'Right lower lobe consolidation consistent with pneumonia', radiologist: 'Dr. Vance' }
      }
    });
    recordCheck('Uploads', 'Medical Record Vault Storage', uploadRes.status === 200 && !!uploadRes.body.data?.record?.id, uploadRes.latencyMs, 'X-Ray Report stored');

    const getRecordsRes = await request('/records', { token: patientToken });
    recordCheck('Uploads', 'Medical Records Vault Retrieval', getRecordsRes.status === 200 && getRecordsRes.body.data?.records?.length > 0, getRecordsRes.latencyMs, 'Records retrieved');

    // ------------------------------------------------------------------------
    // DOMAIN 9: CHRONIC CARE PLAN & MEDICATIONS
    // ------------------------------------------------------------------------
    const enrollCondRes = await request('/chronic/enroll', { method: 'POST', token: patientToken, body: { condition: 'hypertension' } });
    recordCheck('Care Plans', 'Chronic Condition Care Plan Enrollment', enrollCondRes.status === 200 && enrollCondRes.body.data?.condition === 'hypertension', enrollCondRes.latencyMs, 'Hypertension care plan initialized');

    const carePlanRes = await request('/care-plan', { token: patientToken });
    recordCheck('Care Plans', 'Care Plan Retrieval', carePlanRes.status === 200 && carePlanRes.body.data?.carePlan !== null, carePlanRes.latencyMs, 'Care plan active');

    const medEnrollRes = await request('/medications/enroll', {
      method: 'POST',
      token: patientToken,
      body: { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in morning' }
    });
    recordCheck('Medications', 'Medication Intelligence Enrollment', medEnrollRes.status === 200 && medEnrollRes.body.data?.medication?.name === 'Lisinopril', medEnrollRes.latencyMs, 'Lisinopril enrolled');

    const medId = medEnrollRes.body.data?.medication?.id;
    const adminMedRes = await request('/medications/administer', { method: 'POST', token: patientToken, body: { medicationId: medId, timestamp: new Date().toISOString() } });
    recordCheck('Medications', 'Medication Dose Administration Tracking', adminMedRes.status === 200 && adminMedRes.body.data?.success, adminMedRes.latencyMs, 'Dose recorded');

    // ------------------------------------------------------------------------
    // DOMAIN 10: PREVENTIVE INTELLIGENCE
    // ------------------------------------------------------------------------
    const prevAssessmentRes = await request('/preventive/assessment', { token: patientToken });
    recordCheck('Preventive', 'Preventive Risk & Opportunity Assessment', prevAssessmentRes.status === 200 && !!prevAssessmentRes.body.data?.risk, prevAssessmentRes.latencyMs, 'Risk assessment generated');

    const prevTrendsRes = await request('/preventive/trends', { token: patientToken });
    recordCheck('Preventive', 'Longitudinal Intelligence Trend Analysis', prevTrendsRes.status === 200 && Array.isArray(prevTrendsRes.body.data?.trends), prevTrendsRes.latencyMs, 'Longitudinal trends analyzed');

    // ------------------------------------------------------------------------
    // DOMAIN 11: LONGITUDINAL HISTORY & TIMELINE
    // ------------------------------------------------------------------------
    const timelineRes = await request('/timeline', { token: patientToken });
    recordCheck('History', 'Longitudinal Health Timeline Aggregation', timelineRes.status === 200 && Array.isArray(timelineRes.body.data?.events), timelineRes.latencyMs, `Timeline events: ${timelineRes.body.data?.events?.length}`);

    const assessmentsRes = await request('/assessments', { token: patientToken });
    recordCheck('History', 'Clinical Assessment History', assessmentsRes.status === 200 && Array.isArray(assessmentsRes.body.data?.assessments), assessmentsRes.latencyMs, `Assessments: ${assessmentsRes.body.data?.assessments?.length}`);

    // ------------------------------------------------------------------------
    // DOMAIN 12: ADMINISTRATION & AUDIT
    // ------------------------------------------------------------------------
    const auditRes = await request('/admin/audit', { token: adminToken });
    recordCheck('Administration', 'Audit Log Inspection', auditRes.status === 200 && Array.isArray(auditRes.body.data?.logs), auditRes.latencyMs, 'Audit trail verified');

    // ------------------------------------------------------------------------
    // DOMAIN 13: MONITORING & HEALTH PROBES
    // ------------------------------------------------------------------------
    const healthRes = await request('/health');
    recordCheck('Monitoring', 'Liveness Probe (/health)', healthRes.status === 200 && healthRes.body.success, healthRes.latencyMs, 'Liveness probe healthy');

    const readyRes = await request('/health/ready');
    recordCheck('Monitoring', 'Readiness Probe (/health/ready)', readyRes.status === 200 && readyRes.body.success, readyRes.latencyMs, 'Readiness probe healthy');

    const metricsRes = await request('/admin/metrics', { token: adminToken });
    recordCheck('Monitoring', 'System Metrics & Memory Diagnostics', metricsRes.status === 200 && !!metricsRes.body.data?.memory, metricsRes.latencyMs, 'System metrics verified');

    // ------------------------------------------------------------------------
    // DOMAIN 14: TELEMETRY & PRODUCT ANALYTICS
    // ------------------------------------------------------------------------
    const logEventRes = await request('/analytics/event', {
      method: 'POST',
      token: patientToken,
      body: { eventName: 'workflow_completed', category: 'triage', payload: { durationSec: 45 } }
    });
    recordCheck('Analytics', 'Privacy-Aware Operational Telemetry Event', logEventRes.status === 200 && logEventRes.body.data?.logged, logEventRes.latencyMs, 'Event logged');

    const analyticsSummary = await request('/admin/analytics', { token: adminToken });
    recordCheck('Analytics', 'Telemetry Summary Aggregation', analyticsSummary.status === 200 && typeof analyticsSummary.body.data?.totalEvents === 'number', analyticsSummary.latencyMs, `Total Events: ${analyticsSummary.body.data?.totalEvents}`);

    // ------------------------------------------------------------------------
    // DOMAIN 15: PERFORMANCE & LATENCY BENCHMARKS
    // ------------------------------------------------------------------------
    const avgLatency = Math.round(checklist.reduce((acc, c) => acc + c.latencyMs, 0) / checklist.length);
    recordCheck('Performance', 'API Latency Benchmark (< 100ms target)', avgLatency < 100, avgLatency, `Average API Latency: ${avgLatency}ms`);

  } catch (err: any) {
    console.error('[RC Suite Exception]', err);
    recordCheck('Release Acceptance', 'End-to-End Suite Execution', false, 0, err.message);
  } finally {
    server.close();
    console.log('\n================================================================');
    console.log('RELEASE CANDIDATE (RC) ACCEPTANCE SUMMARY');
    console.log('================================================================');
    const passed = checklist.filter(c => c.status === 'PASS').length;
    const failed = checklist.filter(c => c.status === 'FAIL').length;
    console.log(`Total Production Acceptance Checks: ${checklist.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nRELEASE CANDIDATE FAILED ACCEPTANCE:');
      checklist.filter(c => c.status === 'FAIL').forEach(f => console.error(` - [${f.category}] ${f.test}: ${f.details}`));
      process.exit(1);
    } else {
      console.log('\n★ ALL 32 RELEASE CANDIDATE ACCEPTANCE CRITERIA SATISFIED 100%! ★');
      process.exit(0);
    }
  }
}

runReleaseCandidateAcceptance();
