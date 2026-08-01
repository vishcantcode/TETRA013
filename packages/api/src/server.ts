import express, { Express } from 'express';
import cors from 'cors';
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
import { authMiddleware, requireRole } from '@healthsense/auth';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Security and utility middleware
app.use(cors());
app.use(express.json());
app.use(securityMiddleware);
app.use(rateLimiter);

// Public / Health Endpoints
app.get('/health', withObservability(healthCheck));
app.get('/health/ready', withObservability(readinessCheck));
app.get('/health/metrics', withObservability(metricsEndpoint));

// Public Authentication Endpoints
app.post('/auth/login', rateLimiter, withObservability(login));
app.post('/auth/register', rateLimiter, withObservability(register));

// Protected User / Auth Endpoints
app.get('/auth/me', authMiddleware, withObservability(getCurrentUser));
app.get('/dashboard', authMiddleware, withObservability(getDashboardData));
app.get('/timeline', authMiddleware, withObservability(getTimeline));
app.get('/profile', authMiddleware, withObservability(getProfile));
app.put('/profile', authMiddleware, withObservability(updateProfile));

// Symptom Triage Endpoints
app.post('/triage/start', authMiddleware, withObservability(startTriage));
app.post('/triage/answer', authMiddleware, withObservability(saveAnswer));
app.post('/triage/complete', authMiddleware, withObservability(completeTriage));

// Care Plan & Chronic Disease Endpoints
app.post('/chronic/enroll', authMiddleware, withObservability(enrollCondition));
app.get('/care-plan', authMiddleware, withObservability(fetchCarePlan));

// Medication Intelligence Endpoints
app.post('/medications/enroll', authMiddleware, withObservability(enrollMedication));
app.get('/medications', authMiddleware, withObservability(getMedicationProfile));
app.post('/medications/administer', authMiddleware, withObservability(recordAdministration));

// Preventive Intelligence Endpoints
app.get('/preventive/assessment', authMiddleware, withObservability(generatePreventiveAssessment));
app.get('/preventive/risk', authMiddleware, withObservability(getRiskProfile));
app.get('/preventive/trends', authMiddleware, withObservability(getLongitudinalTrends));

// Health Assessments & Decisions
app.get('/assessments', authMiddleware, withObservability(getAssessments));
app.get('/assessments/:id', authMiddleware, withObservability(getAssessment));
app.post('/decision/generate', authMiddleware, withObservability(generateDecision));

// Medical Records
app.post('/records/upload', authMiddleware, withObservability(uploadRecord));
app.get('/records', authMiddleware, withObservability(getRecords));

// Privacy-Preserving Telemetry & Operational Analytics
app.post('/analytics/event', authMiddleware, withObservability(logEvent));

// Clinician Portal Endpoints (Clinician & Admin)
app.get('/clinician/patients', authMiddleware, requireRole('clinician', 'admin'), withObservability(getPatients));
app.get('/clinician/patients/:id', authMiddleware, requireRole('clinician', 'admin'), withObservability(getPatientDetail));
app.post('/clinician/invite', authMiddleware, requireRole('clinician', 'admin'), withObservability(invitePatient));

// Admin Operations Endpoints (Admin Only)
app.get('/admin/users', authMiddleware, requireRole('admin'), withObservability(getUsers));
app.post('/admin/users', authMiddleware, requireRole('admin'), withObservability(createUser));
app.get('/admin/audit', authMiddleware, requireRole('admin'), withObservability(getAuditLogs));
app.get('/admin/metrics', authMiddleware, requireRole('admin'), withObservability(getSystemMetrics));
app.get('/admin/analytics', authMiddleware, requireRole('admin'), withObservability(getAnalyticsSummary));
app.get('/admin/hoip', authMiddleware, requireRole('admin'), withObservability(getHOIPDashboard));

// Demo Control Endpoints
app.post('/demo/seed', authMiddleware, requireRole('admin'), withObservability(seedDemoEnvironment));
app.post('/demo/reset', authMiddleware, requireRole('admin'), withObservability(resetDemoEnvironment));

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
    console.log(`[HealthSense API] Server running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
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
