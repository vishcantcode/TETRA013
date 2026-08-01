import app from '../packages/api/src/server';
import http from 'http';

const PORT = 3999;
const BASE_URL = `http://localhost:${PORT}`;

let server: http.Server;

async function request(path: string, options: { method?: string; token?: string; body?: any } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function runAudit() {
  console.log('====================================================');
  console.log('HEALTHSENSE WAVE 3: END-TO-END WORKFLOW AUDIT');
  console.log('====================================================\n');

  server = app.listen(PORT);
  console.log(`[Test Runner] Server listening on ${BASE_URL}\n`);

  const results: { test: string; status: 'PASSED' | 'FAILED'; details?: string }[] = [];

  const record = (test: string, success: boolean, details?: string) => {
    const status = success ? 'PASSED' : 'FAILED';
    results.push({ test, status, details });
    console.log(`[${status}] ${test}${details ? ` -> ${details}` : ''}`);
  };

  try {
    // 1. Health Check
    const health = await request('/health');
    record('GET /health', health.status === 200 && health.body.success, `status ${health.status}`);

    // 2. Auth Register
    const testEmail = `pilot-user-${Date.now()}@healthsense.ai`;
    const reg = await request('/auth/register', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'PilotPassword123!',
        firstName: 'Elena',
        lastName: 'Rostova',
        dateOfBirth: '1988-04-12',
        gender: 'female'
      }
    });
    record('POST /auth/register', reg.status === 200 && reg.body.success && !!reg.body.data?.token, `Token issued for ${testEmail}`);

    const token = reg.body.data?.token;

    // 3. Auth Login
    const login = await request('/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: 'PilotPassword123!' }
    });
    record('POST /auth/login', login.status === 200 && login.body.success && !!login.body.data?.token, 'Login verified');

    // 4. Auth Me
    const me = await request('/auth/me', { token });
    record('GET /auth/me', me.status === 200 && me.body.data?.user?.email === testEmail, `Role: ${me.body.data?.user?.role}`);

    // 5. Profile Get
    const profile = await request('/profile', { token });
    record('GET /profile', profile.status === 200 && profile.body.data?.profile?.first_name === 'Elena', `Patient: ${profile.body.data?.profile?.first_name} ${profile.body.data?.profile?.last_name}`);

    // 6. Profile Update
    const updateProf = await request('/profile', {
      method: 'PUT',
      token,
      body: { first_name: 'Elena', last_name: 'Vassiliev' }
    });
    record('PUT /profile', updateProf.status === 200 && updateProf.body.data?.profile?.last_name === 'Vassiliev', 'Updated last name to Vassiliev');

    // 7. Dashboard Data
    const dash = await request('/dashboard', { token });
    record('GET /dashboard', dash.status === 200 && typeof dash.body.data?.riskScore === 'number', `Risk score: ${dash.body.data?.riskScore}, Recommendation: ${dash.body.data?.recommendation?.substring(0, 40)}...`);

    // 8. Start Symptom Triage
    const triage = await request('/triage/start', {
      method: 'POST',
      token,
      body: { symptom: 'frequent headaches and mild dizziness' }
    });
    const sessionId = triage.body.data?.sessionId;
    record('POST /triage/start', triage.status === 200 && !!triage.body.data?.decision && !!sessionId, `Decision generated, SessionId: ${sessionId}`);

    // 9. Answer Triage Question
    const ans = await request('/triage/answer', {
      method: 'POST',
      token,
      body: { sessionId, answer: 'No nausea or visual aura' }
    });
    record('POST /triage/answer', ans.status === 200 && ans.body.success, 'Answer saved');

    // 10. Complete Triage
    const completeTriage = await request('/triage/complete', {
      method: 'POST',
      token,
      body: { sessionId }
    });
    record('POST /triage/complete', completeTriage.status === 200 && completeTriage.body.data?.status === 'completed', 'Triage session completed');

    // 11. Chronic Condition Enrollment
    const chronic = await request('/chronic/enroll', {
      method: 'POST',
      token,
      body: { condition: 'diabetes', hba1c: 7.2 }
    });
    record('POST /chronic/enroll', chronic.status === 200 && chronic.body.data?.condition === 'diabetes', 'Diabetes condition enrolled into care plan');

    // 12. Fetch Care Plan
    const carePlan = await request('/care-plan', { token });
    record('GET /care-plan', carePlan.status === 200 && carePlan.body.data?.carePlan !== null, `Care plan status: ${carePlan.body.data?.carePlan?.status}`);

    // 13. Medication Enrollment
    const medEnroll = await request('/medications/enroll', {
      method: 'POST',
      token,
      body: { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
    });
    record('POST /medications/enroll', medEnroll.status === 200 && medEnroll.body.data?.medication?.name === 'Metformin', 'Metformin enrolled');

    const medId = medEnroll.body.data?.medication?.id;

    // 14. Get Medication Profile
    const meds = await request('/medications', { token });
    record('GET /medications', meds.status === 200 && meds.body.data?.medications?.length > 0, `Medications count: ${meds.body.data?.medications?.length}`);

    // 15. Record Medication Administration
    const adminMed = await request('/medications/administer', {
      method: 'POST',
      token,
      body: { medicationId: medId, timestamp: new Date().toISOString() }
    });
    record('POST /medications/administer', adminMed.status === 200 && adminMed.body.data?.success, 'Dose recorded');

    // 16. Preventive Assessment
    const prevAssessment = await request('/preventive/assessment', { token });
    record('GET /preventive/assessment', prevAssessment.status === 200 && !!prevAssessment.body.data?.risk, 'Preventive risk assessment generated');

    // 17. Preventive Risk Profile
    const riskProfile = await request('/preventive/risk', { token });
    record('GET /preventive/risk', riskProfile.status === 200 && !!riskProfile.body.data?.riskProfile, 'Risk profile retrieved');

    // 18. Longitudinal Trends
    const trends = await request('/preventive/trends', { token });
    record('GET /preventive/trends', trends.status === 200 && Array.isArray(trends.body.data?.trends), 'Longitudinal trends analyzed');

    // 19. Get Assessments History
    const assessments = await request('/assessments', { token });
    const assessmentList = assessments.body.data?.assessments || assessments.body.data || [];
    record('GET /assessments', assessments.status === 200 && Array.isArray(assessmentList) && assessmentList.length > 0, `Assessments history count: ${assessmentList.length}`);

    // 20. Decision Generation
    const decision = await request('/decision/generate', {
      method: 'POST',
      token,
      body: { evidence: [{ source: 'patient-reported', confidence: 0.9, data: 'Blood pressure elevated' }] }
    });
    record('POST /decision/generate', decision.status === 200 && !!decision.body.data?.draft, 'Clinical decision pipeline executed');

    // 21. Health Timeline
    const timeline = await request('/timeline', { token });
    const eventList = timeline.body.data?.events || timeline.body.data || [];
    record('GET /timeline', timeline.status === 200 && Array.isArray(eventList) && eventList.length > 0, `Timeline events count: ${eventList.length}`);

  } catch (err: any) {
    console.error('[Runner Exception]', err);
    record('E2E Audit Pipeline', false, err.message);
  } finally {
    server.close();
    console.log('\n====================================================');
    console.log('AUDIT SUMMARY');
    console.log('====================================================');
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    console.log(`Total Workflows Tested: ${results.length}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

    if (failed > 0) {
      console.error('\nFAILED WORKFLOWS:');
      results.filter(r => r.status === 'FAILED').forEach(f => console.error(` - ${f.test}: ${f.details}`));
      process.exit(1);
    } else {
      console.log('\nALL 21 WORKFLOWS PASSED 100% SUCCESSFULLY!');
      process.exit(0);
    }
  }
}

runAudit();
