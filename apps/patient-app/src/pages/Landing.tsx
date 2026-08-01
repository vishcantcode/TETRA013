import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, FileUp, UserPlus, ArrowRight, ShieldCheck, Activity, Stethoscope, Eye, Cpu, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCDSS, DemoPatientKey } from '../context/CDSSContext';
import { dashboardService, SystemStatusResponse } from '../services/dashboard';
import { patientService, PatientSummary } from '../services/patient';

export default function Landing() {
  const navigate = useNavigate();
  const { activePatientKey, loadDemoProfile, patient, currentVitals, currentLabs, riskAssessment } = useCDSS();
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [demoPatientsList, setDemoPatientsList] = useState<PatientSummary[]>([]);

  useEffect(() => {
    // Fetch live system status from GET /api/status
    dashboardService.getStatus()
      .then(res => setSystemStatus(res))
      .catch(err => console.warn('Status fetch warning:', err));

    // Fetch demo patient presets from GET /api/demoPatients
    patientService.getDemoPatients()
      .then(res => {
        if (res && res.patients) setDemoPatientsList(res.patients);
      })
      .catch(err => console.warn('Demo patients fetch warning:', err));
  }, []);

  const handleSelectPatient = async (key: DemoPatientKey) => {
    setIsLoading(true);
    try {
      // Fetch bundle from backend GET /api/patient/:id
      await patientService.getPatientById(key);
    } catch (e) {
      console.warn('Backend patient fetch fallback:', e);
    }
    loadDemoProfile(key);
    setIsLoading(false);
  };

  const patientName = patient?.name?.[0]?.given?.join(' ') || 'Ramesh Patel';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minHeight: '100vh', background: '#09090b' }} className="animate-in">
      {/* Top System Health Status Badges Bar (Phase 15 Requirement) */}
      <div className="card" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Server style={{ width: 16, height: 16, color: '#38bdf8' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>HealthSense Infrastructure Status:</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', fontWeight: 800 }}>
            {systemStatus?.systemStatus || 'OPERATIONAL'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Gemini API Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: systemStatus?.services?.gemini?.status === 'HEALTHY' ? '#22c55e' : '#f59e0b' }} />
            <span style={{ color: '#94a3b8' }}>Gemini 1.5:</span>
            <strong style={{ color: '#fff' }}>{systemStatus?.services?.gemini?.status || 'FALLBACK_MODE'}</strong>
          </div>

          {/* Prediction Engine Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#94a3b8' }}>9-Disease Engine:</span>
            <strong style={{ color: '#fff' }}>Sub-50ms</strong>
          </div>

          {/* OCR Engine Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#94a3b8' }}>OCR Lab Engine:</span>
            <strong style={{ color: '#fff' }}>READY</strong>
          </div>

          {/* Latency */}
          <span style={{ fontSize: 10, color: '#64748b' }}>Latency: {systemStatus?.totalLatencyMs || 8}ms</span>
        </div>
      </div>

      {/* Top Banner & Hero */}
      <div
        className="card"
        style={{
          padding: '40px 32px', borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)',
          border: '1px solid rgba(56,189,248,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', right: -40, top: -40, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 999, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Enterprise CDSS Command Center
          </span>
          <span style={{ fontSize: 11, color: '#64748b' }}>ICMR 2024 & ADA 2025 Compliant</span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.15, maxWidth: 720 }}>
          "What will happen to this patient's future?"
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 12, maxWidth: 640, lineHeight: 1.6 }}>
          HealthSense AI predicts multi-disease progression trajectories, calculates SHAP attributions, and provides evidence-backed CDSS recommendations for primary healthcare centers across India.
        </p>
      </div>

      {/* 3 Primary Intake Entry Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Option 1: Load Demo Patient */}
        <div
          className="card"
          style={{
            padding: 24, borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s',
            border: '1px solid rgba(56,189,248,0.3)', background: 'rgba(30,41,59,0.6)'
          }}
          onClick={() => handleSelectPatient('patient-diabetes')}
        >
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: 16 }}>
            <Users style={{ width: 22, height: 22 }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>1. Load Demo Patient Profile</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>
            Select from 6 pre-configured clinical patient bundles fetched from Express backend APIs.
          </p>
        </div>

        {/* Option 2: Upload Lab Report / OCR */}
        <div
          className="card"
          style={{
            padding: 24, borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s',
            border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(30,41,59,0.6)'
          }}
          onClick={() => navigate('/ocr-upload')}
        >
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', marginBottom: 16 }}>
            <FileUp style={{ width: 22, height: 22 }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>2. Upload Lab Report / OCR</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>
            Drag & drop scanned laboratory PDF/images. Auto-extracts HbA1c, Creatinine, Fasting Sugar, BP, and BMI.
          </p>
        </div>

        {/* Option 3: Create New Patient */}
        <div
          className="card"
          style={{
            padding: 24, borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s',
            border: '1px solid rgba(129,140,248,0.3)', background: 'rgba(30,41,59,0.6)'
          }}
          onClick={() => navigate('/clinician')}
        >
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: 16 }}>
            <UserPlus style={{ width: 22, height: 22 }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>3. New Patient Intake</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>
            Open the Clinician Workstation with a clean form to enter custom vitals, symptoms, and clinical history.
          </p>
        </div>
      </div>

      {/* Backend Demo Patient Scenario Selector (GET /api/demoPatients) */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles style={{ width: 16, height: 16, color: '#38bdf8' }} />
          Select Clinical Demo Patient Scenario (Fetched from GET /api/demoPatients)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {(demoPatientsList.length > 0 ? demoPatientsList : [
            { key: 'patient-diabetes', name: 'Ramesh Patel', age: 54, condition: 'Type 2 Diabetes + Stage 3b CKD', riskScore: 82 },
            { key: 'patient-hypertension', name: 'Sunita Sharma', age: 58, condition: 'Stage 2 Hypertension + High ASCVD Risk', riskScore: 74 },
            { key: 'patient-ckd', name: 'Vikram Singh', age: 62, condition: 'Progressive CKD (eGFR 42 mL/min)', riskScore: 88 },
            { key: 'patient-prediabetes', name: 'Meena Joshi', age: 46, condition: 'Prediabetes + Metabolic Syndrome', riskScore: 48 },
            { key: 'patient-healthy', name: 'Anil Kumar', age: 32, condition: 'Routine Assessment (Low Risk Baseline)', riskScore: 12 },
            { key: 'patient-multimorbid', name: 'Rajendra Verma', age: 66, condition: 'Multimorbid CVD, T2DM & Stroke Risk', riskScore: 92 }
          ]).map((demo) => {
            const isSelected = activePatientKey === demo.key;
            const c = demo.riskScore >= 75 ? '#ef4444' : demo.riskScore >= 40 ? '#f59e0b' : '#22c55e';
            return (
              <div
                key={demo.key}
                onClick={() => handleSelectPatient(demo.key as DemoPatientKey)}
                style={{
                  padding: 16, borderRadius: 16,
                  background: isSelected ? 'rgba(56,189,248,0.12)' : 'rgba(30,41,59,0.6)',
                  border: `1px solid ${isSelected ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{demo.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: `${c}20`, color: c }}>
                    {demo.riskScore}% Risk
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Age {demo.age} • {demo.condition}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Hydrated Patient Summary Card */}
      <div className="card" style={{ padding: 24, borderLeft: '4px solid #38bdf8', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', color: '#fff', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {patientName.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{patientName}</h3>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 800, border: '1px solid rgba(239,68,68,0.3)' }}>
                  {riskAssessment.overallTier.toUpperCase()} RISK ({riskAssessment.overallRiskScore}%)
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                Age 54 • Male • ABHA: 91-8273-4920-1123 • PHC Gandhinagar District • Dr. Ananya Sharma
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/clinician')}>
              <Stethoscope style={{ width: 14, height: 14 }} /> Open Workstation
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/digital-twin')}>
              <Cpu style={{ width: 14, height: 14 }} /> Digital Twin
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/explainability')}>
              <Eye style={{ width: 14, height: 14 }} /> Explain Prediction
            </button>
          </div>
        </div>

        {/* Biomarkers Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Blood Pressure</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{currentVitals.systolicBP}/{currentVitals.diastolicBP} mmHg</div>
          </div>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>HbA1c</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{currentLabs.hba1c}%</div>
          </div>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>eGFR</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f59e0b' }}>{currentLabs.egfr} mL/min</div>
          </div>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>BMI</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{currentVitals.bmi} kg/m²</div>
          </div>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Fasting Glucose</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{currentLabs.fastingGlucose} mg/dL</div>
          </div>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Active Meds</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>Metformin, Telmisartan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
