import express, { Express } from 'express';
import cors from 'cors';
import { handlePredict } from './endpoints/predict';
import { handleChat } from './endpoints/chat';
import { handleOCR } from './endpoints/ocr';
import { handleReport } from './endpoints/report';
import { handleTranslate } from './endpoints/translate';
import { handleWhatIf } from './endpoints/whatif';
import { handleDigitalTwin } from './endpoints/digital-twin';
import { handleSOAP } from './endpoints/soap';
import { handleExplain } from './endpoints/explain';

import { getDashboardData } from './endpoints/dashboard';
import { login, register, getCurrentUser } from './endpoints/auth';
import { getTimeline } from './endpoints/timeline';
import { getProfile, updateProfile } from './endpoints/profile';
import { getAssessments, getAssessment } from './endpoints/assessments';
import { enrollCondition, fetchCarePlan } from './endpoints/chronic';
import { enrollMedication, getMedicationProfile, recordAdministration } from './endpoints/medication';
import { generatePreventiveAssessment, getRiskProfile, getLongitudinalTrends } from './endpoints/preventive';
import { healthCheck, readinessCheck, metricsEndpoint } from './endpoints/health';
import { startTriage, saveAnswer, completeTriage } from './endpoints/triage';
import { seedDemoEnvironment, resetDemoEnvironment } from './endpoints/demo';
import { generateDecision } from './endpoints/generate-decision';
import { getUsers, createUser, getAuditLogs, getSystemMetrics, getHOIPDashboard } from './endpoints/admin';
import { getPatients, getPatientDetail, invitePatient } from './endpoints/clinician';
import { uploadRecord, getRecords } from './endpoints/records';
import { logEvent, getAnalyticsSummary } from './endpoints/analytics';
import { withObservability } from './middleware/logging';
import { securityMiddleware, rateLimiter } from './middleware/security';
import { config } from './config';

const app: Express = express();
const PORT = config.port;

// Security and utility middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(securityMiddleware);
app.use(rateLimiter);

// Public / Health Endpoints
app.get('/health', withObservability(healthCheck));
app.get('/health/ready', withObservability(readinessCheck));
app.get('/health/metrics', withObservability(metricsEndpoint));

// Core CDSS AI & Gemini Express Proxy API Endpoints
app.post('/api/predict', withObservability(handlePredict));
app.post('/api/chat', withObservability(handleChat));
app.post('/api/ocr', withObservability(handleOCR));
app.post('/api/report', withObservability(handleReport));
app.post('/api/translate', withObservability(handleTranslate));
app.post('/api/whatif', withObservability(handleWhatIf));
app.post('/api/digital-twin', withObservability(handleDigitalTwin));
app.post('/api/soap', withObservability(handleSOAP));
app.post('/api/explain', withObservability(handleExplain));

// Auth & Dashboard Endpoints
app.post('/auth/login', rateLimiter, withObservability(login));
app.post('/auth/register', rateLimiter, withObservability(register));
app.get('/auth/me', withObservability(getCurrentUser));
app.get('/dashboard', withObservability(getDashboardData));
app.get('/timeline', withObservability(getTimeline));
app.get('/profile', withObservability(getProfile));
app.put('/profile', withObservability(updateProfile));

// Symptom Triage Endpoints
app.post('/triage/start', withObservability(startTriage));
app.post('/triage/answer', withObservability(saveAnswer));
app.post('/triage/complete', withObservability(completeTriage));

// Care Plan & Chronic Disease Endpoints
app.post('/chronic/enroll', withObservability(enrollCondition));
app.get('/care-plan', withObservability(fetchCarePlan));

// Medication Endpoints
app.post('/medications/enroll', withObservability(enrollMedication));
app.get('/medications', withObservability(getMedicationProfile));
app.post('/medications/administer', withObservability(recordAdministration));

// Preventive Intelligence Endpoints
app.get('/preventive/assessment', withObservability(generatePreventiveAssessment));
app.get('/preventive/risk', withObservability(getRiskProfile));
app.get('/preventive/trends', withObservability(getLongitudinalTrends));

// Health Assessments & Decisions
app.get('/assessments', withObservability(getAssessments));
app.get('/assessments/:id', withObservability(getAssessment));
app.post('/decision/generate', withObservability(generateDecision));

// Medical Records
app.post('/records/upload', withObservability(uploadRecord));
app.get('/records', withObservability(getRecords));

// Analytics
app.post('/analytics/event', withObservability(logEvent));

// Clinician Portal
app.get('/clinician/patients', withObservability(getPatients));
app.get('/clinician/patients/:id', withObservability(getPatientDetail));
app.post('/clinician/invite', withObservability(invitePatient));

// Admin & Demo
app.get('/admin/users', withObservability(getUsers));
app.post('/admin/users', withObservability(createUser));
app.get('/admin/audit', withObservability(getAuditLogs));
app.get('/admin/metrics', withObservability(getSystemMetrics));
app.get('/admin/analytics', withObservability(getAnalyticsSummary));
app.get('/admin/hoip', withObservability(getHOIPDashboard));

app.post('/demo/seed', withObservability(seedDemoEnvironment));
app.post('/demo/reset', withObservability(resetDemoEnvironment));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Global API Error]', err);
  res.status(500).json({ error: 'Internal Server Error', correlationId: req.headers['x-correlation-id'] || null });
});

let server: any;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`[HealthSense Express API] Server running on port ${PORT} (Gemini API: ${config.hasGeminiKey ? 'ENABLED' : 'FALLBACK MODE'})`);
  });

  const shutdown = () => {
    console.log('Shutting down server...');
    if (server) {
      server.close(() => {
        console.log('Server shut down.');
        process.exit(0);
      });
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default app;
