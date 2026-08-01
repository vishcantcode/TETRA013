import app from '../packages/api/src/server';
import { hoip, HOIPAnalyticsEngine, HOIPRecommendationEngine, HOIPAlertEngine } from '../packages/hoip/src';
import http from 'http';

const PORT = 3996;
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

async function runHOIPTestSuite() {
  console.log('================================================================');
  console.log('HEALTHSENSE BACKEND EXCELLENCE: HOIP PLATFORM TEST SUITE');
  console.log('================================================================\n');

  server = app.listen(PORT);
  console.log(`[HOIP Runner] Server running on ${BASE_URL}\n`);

  const tests: { name: string; success: boolean; details?: string }[] = [];

  const record = (name: string, success: boolean, details?: string) => {
    tests.push({ name, success, details });
    const symbol = success ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${name}${details ? ` -> ${details}` : ''}`);
  };

  try {
    // TEST 1: Quad-Platform Operational Telemetry Computation
    const metrics = await HOIPAnalyticsEngine.getInstance().computeMetrics();
    record('HOIP Operational Telemetry Aggregation', typeof metrics.averageLatencyMs === 'number' && typeof metrics.cacheHitRatioPercent === 'number', `Avg Latency: ${metrics.averageLatencyMs}ms, Cache Hit Ratio: ${metrics.cacheHitRatioPercent}%, State Transitions: ${metrics.stateTransitionCount}`);

    // TEST 2: Evidence-Based Recommendation Engine
    const recommendations = HOIPRecommendationEngine.generateRecommendations(metrics);
    const hasEvidence = recommendations.every(r => r.supportingEvidence && r.suggestion);
    record('HOIP Evidence-Based Recommendation Generation', recommendations.length >= 2 && hasEvidence, `Generated ${recommendations.length} recommendations (Categories: ${recommendations.map(r => r.category).join(', ')})`);

    // TEST 3: Intelligent Alert Engine Evaluation
    const alerts = HOIPAlertEngine.evaluateAlerts(metrics);
    record('HOIP Intelligent Alert Engine', Array.isArray(alerts), `Alerts Evaluated: ${alerts.length} active warnings`);

    // TEST 4: Live HOIP Dashboard API Endpoint (/admin/hoip)
    const adminEmail = `admin-hoip-${Date.now()}@healthsense.ai`;
    await request('/auth/register', {
      method: 'POST',
      body: { email: adminEmail, password: 'AdminPassword123!', firstName: 'HOIP', lastName: 'Admin', dateOfBirth: '1980-01-01', gender: 'male' }
    });
    const { pool } = await import('@healthsense/db');
    await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [adminEmail]);

    const loginRes = await request('/auth/login', { method: 'POST', body: { email: adminEmail, password: 'AdminPassword123!' } });
    const adminToken = loginRes.body.data?.token;

    const hoipApiRes = await request('/admin/hoip', { token: adminToken });
    const isApiWorking = hoipApiRes.status === 200 && hoipApiRes.body.data?.systemStatus === 'OPTIMAL';
    record('HOIP Admin Dashboard API Integration (/admin/hoip)', isApiWorking, `Status: ${hoipApiRes.body.data?.systemStatus}, Metrics Total Executions: ${hoipApiRes.body.data?.metrics?.totalExecutions}`);

    // TEST 5: HOIP Analytics Processing Overhead Benchmark (< 1ms Target)
    const benchStart = performance.now();
    const ITERATIONS = 100;
    for (let i = 0; i < ITERATIONS; i++) {
      await hoip.getOperationalDashboard();
    }
    const avgHoipMs = (performance.now() - benchStart) / ITERATIONS;
    record('HOIP Operational Intelligence Benchmark (< 1ms Target)', avgHoipMs < 1, `Average HOIP Processing Time: ${avgHoipMs.toFixed(3)}ms`);

  } catch (err: any) {
    console.error('[HOIP Suite Exception]', err);
    record('HOIP Platform Suite Execution', false, err.message);
  } finally {
    server.close(() => {
      setTimeout(() => {
        console.log('\n================================================================');
        console.log('HOIP PLATFORM ACCEPTANCE SUMMARY');
        console.log('================================================================');
        const passed = tests.filter(t => t.success).length;
        const failed = tests.filter(t => !t.success).length;
        console.log(`Total HOIP Platform Tests: ${tests.length}`);
        console.log(`PASSED: ${passed}`);
        console.log(`FAILED: ${failed}`);

        if (failed > 0) {
          console.error('\nHOIP PLATFORM SUITE FAILED!');
          process.exit(1);
        } else {
          console.log('\n★ ALL HOIP PLATFORM TESTS PASSED 100% SUCCESSFULLY! ★');
          process.exit(0);
        }
      }, 50);
    });
  }
}

runHOIPTestSuite();
