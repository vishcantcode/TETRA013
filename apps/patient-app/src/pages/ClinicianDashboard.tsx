import React, { useState } from 'react';
import {
  Activity, ShieldCheck, AlertOctagon, RefreshCw, Zap, Sliders, ChevronRight,
  TrendingUp, Sparkles, BookOpen, Stethoscope, Heart, Eye, Footprints, FileText,
  Clock, Database, UserCheck, PhoneCall, Check, Wand2
} from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';
import { AICommandBar } from '../components/ui/AICommandBar';
import { SHAPChart } from '../components/ui/SHAPChart';
import { GuidelineDrawer } from '../components/ui/GuidelineDrawer';
import { UploadZone } from '../components/ui/UploadZone';
import { DigitalTwinViewer } from '../components/ui/DigitalTwinViewer';
import { api } from '../api';

type TabKey = 'overview' | 'labs' | 'prediction' | 'digital-twin' | 'treatment' | 'timeline' | 'documents' | 'soap';

export default function ClinicianDashboard() {
  const {
    patient, currentVitals, updateVitals, currentLabs, updateLabs,
    riskAssessment, explainabilityReport, referralDecision, educationPlan,
    digitalTwin, soapNoteText, setSoapNoteText, setActiveGuidelineDrawer
  } = useCDSS();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedDisease, setSelectedDisease] = useState<string>('diabetes');
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);

  const patientName = patient?.name?.[0]?.given?.join(' ') || 'Ramesh Patel';
  const diseaseKeys = Object.keys(riskAssessment.diseaseResults);

  const handleGenerateSOAP = async () => {
    setIsGeneratingSOAP(true);
    try {
      const res = await api.cdss.soap({
        patient: { name: patient?.name, age: 54, gender: 'Male', vitals: currentVitals, labs: currentLabs },
        assessment: riskAssessment
      });
      if (res && res.soapNote) {
        setSoapNoteText(res.soapNote);
      }
    } catch (e) {
      console.warn('SOAP Generation Fallback:', e);
      setSoapNoteText(`### SUBJECTIVE\nPatient Ramesh Patel (Age 54, Male) presents for routine evaluation. Compliant with Metformin 500mg BID.\n\n### OBJECTIVE\n- SBP/DBP: ${currentVitals.systolicBP}/${currentVitals.diastolicBP} mmHg\n- HbA1c: ${currentLabs.hba1c}%\n- eGFR: ${currentLabs.egfr} mL/min\n- BMI: ${currentVitals.bmi} kg/m²\n\n### ASSESSMENT\n1. Type 2 Diabetes Mellitus - Uncontrolled (HbA1c 8.4% vs ADA 2025 target < 7.0%).\n2. Essential Hypertension - Stage 1 (138/88 mmHg vs ICMR 2024 target < 130/80 mmHg).\n3. Stage 2/3a CKD (eGFR 78 mL/min).\n\n### PLAN\n1. Initiate SGLT2 inhibitor (Dapagliflozin 10mg OD) for glycemic and renal protection.\n2. Dilated Eye Exam within 30 days.\n3. High-fiber Indian diet (Ragi, Millets, Moong Dal) & 30-min brisk walk daily.`);
    } finally {
      setIsGeneratingSOAP(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in">
      <TopNavigation />

      {/* Top Patient Banner */}
      <div
        className="card"
        style={{
          padding: 20, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.8) 100%)',
          border: '1px solid rgba(56,189,248,0.3)', display: 'flex', flexDirection: 'column', gap: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', color: '#fff', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {patientName.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{patientName}</h2>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {riskAssessment.overallTier.toUpperCase()} RISK ({riskAssessment.overallRiskScore}%)
                </span>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                  ABHA: 91-8273-4920-1123
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                Age 54 • Male • Blood Group B+ • PHC Gandhinagar • Emergency: +91 98250 12345 (Wife: Savita Patel)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ padding: '6px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', fontSize: 11, color: '#94a3b8' }}>
              Next Visit: <strong style={{ color: '#fff' }}>14 Days</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          {(['overview', 'labs', 'prediction', 'digital-twin', 'treatment', 'timeline', 'documents', 'soap'] as TabKey[]).map(tab => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                  background: isSelected ? 'linear-gradient(135deg, #2563eb, #38bdf8)' : 'transparent',
                  color: isSelected ? '#fff' : '#94a3b8', border: 'none', cursor: 'pointer',
                  whiteSpace: 'nowrap', textTransform: 'capitalize', transition: 'all 0.15s'
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive AI Command Bar */}
      <AICommandBar />

      {/* Main Workstation Layout (Left Panel: Intake | Center Panel: Active Tab View) */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* LEFT PANEL: Editable Patient Vitals & Labs Inputs */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders style={{ width: 16, height: 16, color: '#38bdf8' }} />
            Live Vitals & Labs Intake
          </h3>
          <p style={{ fontSize: 11, color: '#64748b' }}>Changing values automatically recalculates all 9 disease risk scores.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Systolic BP (mmHg)</label>
              <input
                type="number" value={currentVitals.systolicBP}
                onChange={e => updateVitals({ systolicBP: parseInt(e.target.value, 10) || 120 })}
                style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>HbA1c Glycated Sugar (%)</label>
              <input
                type="number" step="0.1" value={currentLabs.hba1c}
                onChange={e => updateLabs({ hba1c: parseFloat(e.target.value) || 5.7 })}
                style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#ef4444', fontSize: 13, fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>eGFR Kidney Filtration (mL/min)</label>
              <input
                type="number" value={currentLabs.egfr}
                onChange={e => updateLabs({ egfr: parseInt(e.target.value, 10) || 90 })}
                style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#f59e0b', fontSize: 13, fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>BMI (kg/m²)</label>
              <input
                type="number" step="0.1" value={currentVitals.bmi}
                onChange={e => updateVitals({ bmi: parseFloat(e.target.value) || 24 })}
                style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Fasting Glucose (mg/dL)</label>
              <input
                type="number" value={currentLabs.fastingGlucose}
                onChange={e => updateLabs({ fastingGlucose: parseInt(e.target.value, 10) || 100 })}
                style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}
              />
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Dynamic Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeTab === 'overview' && (
            <>
              {/* 9-Disease Risk Prediction Grid */}
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap style={{ width: 16, height: 16, color: '#38bdf8' }} />
                  Deterministic 9-Disease Risk Prediction Grid
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {diseaseKeys.map(key => {
                    const res = riskAssessment.diseaseResults[key as keyof typeof riskAssessment.diseaseResults];
                    const isSevere = res.riskScore >= 75;
                    const isHigh = res.riskScore >= 50;
                    const c = isSevere ? '#ef4444' : isHigh ? '#f59e0b' : '#22c55e';
                    return (
                      <div
                        key={key}
                        onClick={() => { setSelectedDisease(key); setActiveTab('prediction'); }}
                        style={{
                          padding: 14, borderRadius: 14, background: `${c}08`, border: `1px solid ${c}25`,
                          cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 6
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{res.diseaseName}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 22, fontWeight: 900, color: c }}>{res.riskScore}%</span>
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: `${c}15`, color: c, textTransform: 'capitalize', fontWeight: 700 }}>
                            {res.severityTier}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>Confidence: {Math.round(res.confidenceScore * 100)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'prediction' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {diseaseKeys.map(key => (
                  <button
                    key={key} onClick={() => setSelectedDisease(key)}
                    style={{
                      padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                      background: selectedDisease === key ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                      color: selectedDisease === key ? '#fff' : '#94a3b8', border: 'none', cursor: 'pointer'
                    }}
                  >
                    {key.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <SHAPChart diseaseName={selectedDisease.toUpperCase()} attribution={explainabilityReport.diseaseAttributions[selectedDisease]} />
            </div>
          )}

          {activeTab === 'digital-twin' && <DigitalTwinViewer />}

          {activeTab === 'documents' && <UploadZone />}

          {activeTab === 'soap' && (
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText style={{ width: 16, height: 16, color: '#38bdf8' }} />
                  Doctor SOAP Note Editor (Subjective, Objective, Assessment, Plan)
                </h3>
                <button className="btn btn-primary btn-sm" onClick={handleGenerateSOAP} disabled={isGeneratingSOAP}>
                  <Wand2 style={{ width: 14, height: 14 }} /> {isGeneratingSOAP ? 'Generating via Gemini...' : 'AI Auto-Complete SOAP'}
                </button>
              </div>

              <textarea
                rows={14} value={soapNoteText}
                onChange={e => setSoapNoteText(e.target.value)}
                placeholder="Click 'AI Auto-Complete SOAP' or type clinical notes..."
                style={{
                  width: '100%', padding: 16, borderRadius: 14, background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, lineHeight: 1.6,
                  fontFamily: 'monospace', outline: 'none'
                }}
              />
            </div>
          )}

          {(activeTab === 'labs' || activeTab === 'treatment' || activeTab === 'timeline') && (
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', textTransform: 'capitalize' }}>
                {activeTab} Management Panel
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Grounded in ICMR 2024 & ADA 2025 Clinical Guidelines. Overall Composite Risk Score: <strong style={{ color: '#ef4444' }}>{riskAssessment.overallRiskScore}% ({riskAssessment.overallTier.toUpperCase()})</strong>.
              </p>
            </div>
          )}
        </div>
      </div>

      <GuidelineDrawer />
    </div>
  );
}
