import React, { useState } from 'react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';
import { RiskGauge } from '../components/ui/RiskGauge';
import { ReferralCard } from '../components/ui/ReferralCard';
import { GuidelineDrawer } from '../components/ui/GuidelineDrawer';
import { EmergencyPanel } from '../components/ui/EmergencyPanel';
import { ActionPlanWidget } from '../components/ui/ActionPlanWidget';
import { CostEstimatorCard } from '../components/ui/CostEstimatorCard';
import { AICommandBar } from '../components/ui/AICommandBar';
import { TimeMachineSlider } from '../components/ui/TimeMachineSlider';
import {
  Activity, AlertTriangle, ShieldCheck, Clock, BookOpen,
  MapPin, Phone, Heart, Cpu, TrendingUp, User, ChevronRight,
  Zap, Star
} from 'lucide-react';

/* ─── Helper: Vital tile ─── */
const VitalTile: React.FC<{
  label: string; sublabel: string; value: string; unit: string; status?: 'ok' | 'warn' | 'bad';
}> = ({ label, sublabel, value, unit, status = 'ok' }) => {
  const color = status === 'bad' ? '#ef4444' : status === 'warn' ? '#f59e0b' : '#22c55e';
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 16,
      background: 'rgba(30,41,59,0.7)', border: `1px solid ${color}20`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: color, opacity: 0.6 }} />
      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value}<span style={{ fontSize: 11, fontWeight: 500, color: '#64748b', marginLeft: 3 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{sublabel}</div>
    </div>
  );
};

/* ─── Helper: Guideline rule row ─── */
const GuidelineRow: React.FC<{
  cite: { source: string; evidenceLevel: string; title: string; clinicalRationale: string };
  onClick: () => void;
}> = ({ cite, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 14,
      background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.06)',
      cursor: 'pointer', transition: 'all 0.15s', display: 'flex', gap: 12, alignItems: 'flex-start',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.35)'; e.currentTarget.style.background = 'rgba(56,189,248,0.04)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(30,41,59,0.6)'; }}
  >
    <div style={{ flexShrink: 0, marginTop: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
        {cite.source}
      </span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cite.title}</div>
      <div style={{ fontSize: 11, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cite.clinicalRationale}</div>
    </div>
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <span style={{ fontSize: 10, color: '#475569' }}>{cite.evidenceLevel}</span>
      <ChevronRight style={{ width: 12, height: 12, color: '#475569' }} />
    </div>
  </button>
);

/* ─── Timeline event ─── */
const TimelineEvent: React.FC<{ event: { id: string; title: string; timestamp: string; description: string }; last?: boolean }> = ({ event, last }) => (
  <div style={{ display: 'flex', gap: 12, paddingBottom: last ? 0 : 16, position: 'relative' }}>
    {!last && <div style={{ position: 'absolute', left: 7, top: 18, bottom: 0, width: 1, background: 'rgba(255,255,255,0.06)' }} />}
    <div style={{ flexShrink: 0, width: 15, height: 15, borderRadius: '50%', background: 'rgba(56,189,248,0.15)', border: '1.5px solid rgba(56,189,248,0.5)', marginTop: 2 }} />
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{event.title}</span>
        <span style={{ fontSize: 10, color: '#475569', flexShrink: 0, marginLeft: 8 }}>{event.timestamp}</span>
      </div>
      <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{event.description}</p>
    </div>
  </div>
);

/* ─── Section header ─── */
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; badge?: string; right?: React.ReactNode }> = ({ icon, title, badge, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
    <div style={{ color: '#38bdf8' }}>{icon}</div>
    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', flex: 1 }}>{title}</span>
    {badge && <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}>{badge}</span>}
    {right}
  </div>
);

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function ClinicianDashboard() {
  const {
    patient, riskAssessment, explainabilityReport,
    referralDecision, educationPlan, digitalTwin,
    setActiveGuidelineDrawer
  } = useCDSS();

  const f = riskAssessment.snapshot.features;
  const patientName = `${patient.name[0]?.given?.join(' ') ?? 'Patient'} ${patient.name[0]?.family ?? ''}`.trim();
  const initials = patient.name[0]?.given?.[0]?.[0] ?? 'P';

  const overallRisk = riskAssessment.overallRiskScore;
  const riskColor = overallRisk >= 75 ? '#ef4444' : overallRisk >= 50 ? '#f59e0b' : overallRisk >= 25 ? '#38bdf8' : '#22c55e';
  const riskLabel = overallRisk >= 75 ? 'SEVERE' : overallRisk >= 50 ? 'HIGH' : overallRisk >= 25 ? 'MODERATE' : 'LOW';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-in">
      <TopNavigation />

      {/* ── AI COMMAND BAR ── */}
      <AICommandBar />

      {/* ── EMERGENCY ALERT (conditional) ── */}
      <EmergencyPanel />

      {/* ════════════════════════════════════════════════
          HERO: PATIENT BANNER
      ════════════════════════════════════════════════ */}
      <div style={{
        borderRadius: 24, padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto',
        gap: 20,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${riskColor}15 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Avatar */}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${riskColor}20`, border: `2px solid ${riskColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: riskColor }}>
          {initials}
        </div>

        {/* Identity */}
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>{patientName}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span>{f.age} yrs • {f.gender}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 11, height: 11 }} />Gandhinagar Rural PHC</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone style={{ width: 11, height: 11 }} />+91 98765 43210</span>
            <span style={{ fontFamily: 'monospace' }}>ABHA: 91-4820-1940</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {f.activeConditions.map((c, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}>{c}</span>
            ))}
          </div>
        </div>

        {/* Overall score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Composite Risk</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: riskColor, lineHeight: 1, letterSpacing: '-0.04em' }}>{overallRisk}<span style={{ fontSize: 18 }}>%</span></div>
          <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: `${riskColor}15`, border: `1px solid ${riskColor}30`, color: riskColor, marginTop: 4, display: 'inline-block' }}>{riskLabel}</div>
        </div>

        {/* Health score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Digital Twin</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: '#22c55e', lineHeight: 1, letterSpacing: '-0.04em' }}>{digitalTwin.healthState.overallHealthScore}<span style={{ fontSize: 16, color: '#64748b' }}>/100</span></div>
          <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', marginTop: 4, display: 'inline-block' }}>HEALTH SCORE</div>
        </div>
      </div>

      {/* ── TIME MACHINE ── */}
      <TimeMachineSlider />

      {/* ════════════════════════════════════════════════
          VITALS STRIP
      ════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        <VitalTile label="Blood Pressure" sublabel="Upper / Lower Pressure" value={`${f.systolicBP ?? 138}/${f.diastolicBP ?? 88}`} unit="mmHg" status={(f.systolicBP ?? 138) >= 140 ? 'bad' : (f.systolicBP ?? 138) >= 130 ? 'warn' : 'ok'} />
        <VitalTile label="HbA1c" sublabel="3-Month Sugar Average" value={String(f.hba1c ?? '8.4')} unit="%" status={(f.hba1c ?? 8.4) >= 8 ? 'bad' : (f.hba1c ?? 8.4) >= 6.5 ? 'warn' : 'ok'} />
        <VitalTile label="eGFR" sublabel="Kidney Filter Score" value={String(f.egfr ?? 78)} unit="mL/min" status={(f.egfr ?? 78) < 45 ? 'bad' : (f.egfr ?? 78) < 60 ? 'warn' : 'ok'} />
        <VitalTile label="BMI" sublabel="Weight-Height Ratio" value={String(f.bmi ?? '28.4')} unit="kg/m²" status={(f.bmi ?? 28.4) >= 30 ? 'bad' : (f.bmi ?? 28.4) >= 25 ? 'warn' : 'ok'} />
        <VitalTile label="Fasting Glucose" sublabel="FBS Glucose Level" value={String(f.fastingGlucose ?? 126)} unit="mg/dL" status={(f.fastingGlucose ?? 126) >= 126 ? 'bad' : (f.fastingGlucose ?? 126) >= 100 ? 'warn' : 'ok'} />
        <VitalTile label="Waist Circ." sublabel="Abdominal Obesity" value={String(f.waistCircumferenceCm ?? 92)} unit="cm" status={(f.waistCircumferenceCm ?? 92) >= 90 ? 'bad' : (f.waistCircumferenceCm ?? 92) >= 80 ? 'warn' : 'ok'} />
      </div>

      {/* ════════════════════════════════════════════════
          RISK GAUGES ROW
      ════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: 20 }}>
        <SectionHeader
          icon={<ShieldCheck style={{ width: 16, height: 16 }} />}
          title="Multi-Disease Risk Matrix"
          badge={`Overall: ${riskAssessment.overallRiskScore}%`}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          <RiskGauge score={riskAssessment.diseaseResults.diabetes.riskScore}    title="Diabetes"    subtitle="Blood Sugar"  size="sm" />
          <RiskGauge score={riskAssessment.diseaseResults.hypertension.riskScore} title="Hypertension" subtitle="High BP"     size="sm" />
          <RiskGauge score={riskAssessment.diseaseResults.ckd.riskScore}          title="CKD"          subtitle="Kidneys"     size="sm" />
          <RiskGauge score={riskAssessment.diseaseResults.cvd.riskScore}          title="CVD"          subtitle="Heart"       size="sm" />
          <RiskGauge score={riskAssessment.diseaseResults.stroke.riskScore}       title="Stroke"       subtitle="Brain"       size="sm" />
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          3-COLUMN MAIN WORKSTATION
      ════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: Action Plan + Education ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ActionPlanWidget />

          {/* Education summary */}
          <div className="card" style={{ padding: 20 }}>
            <SectionHeader icon={<BookOpen style={{ width: 15, height: 15 }} />} title="Patient Guidance" />
            <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(56,189,248,0.04)', borderLeft: '3px solid rgba(56,189,248,0.4)', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>{educationPlan.summary.headline}</div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{educationPlan.summary.summaryText}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '8px 12px', borderRadius: 12, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                Send via WhatsApp
              </button>
              <button style={{ flex: 1, padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                हिंदी / ગુજરાતી
              </button>
            </div>
          </div>

          <CostEstimatorCard />
        </div>

        {/* ── CENTER: Guidelines + Referrals ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Guideline alerts */}
          <div className="card" style={{ padding: 20 }}>
            <SectionHeader
              icon={<AlertTriangle style={{ width: 15, height: 15 }} />}
              title="Triggered Clinical Guidelines"
              badge={`${explainabilityReport.guidelineCitations.length} Rules`}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {explainabilityReport.guidelineCitations.map((cite, idx) => (
                <GuidelineRow key={idx} cite={cite} onClick={() => setActiveGuidelineDrawer(cite)} />
              ))}
            </div>
          </div>

          {/* Referrals */}
          {referralDecision.isReferralRequired && referralDecision.referrals.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <SectionHeader
                icon={<TrendingUp style={{ width: 15, height: 15 }} />}
                title="Specialist Referrals"
                badge={`${referralDecision.referrals.length} Required`}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {referralDecision.referrals.map((ref, i) => (
                  <ReferralCard key={i} item={ref} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Timeline + AI Explainability ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Clinical journey */}
          <div className="card" style={{ padding: 20 }}>
            <SectionHeader icon={<Clock style={{ width: 15, height: 15 }} />} title="Clinical Journey" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {digitalTwin.timeline.slice(0, 5).map((event, i, arr) => (
                <TimelineEvent key={event.id} event={event} last={i === arr.length - 1} />
              ))}
            </div>
          </div>

          {/* AI Explainability */}
          <div className="card" style={{ padding: 20 }}>
            <SectionHeader icon={<Zap style={{ width: 15, height: 15 }} />} title="Top Risk Drivers" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.values(explainabilityReport.diseaseAttributions).slice(0, 1).flatMap((d: { topPositiveContributors: { featureName: string; weightPercentage: number }[] }) =>
                d.topPositiveContributors.slice(0, 4).map((feat, i) => {
                  const pct = Math.min(Math.abs(Math.round(feat.weightPercentage)), 100);
                  const isPositive = feat.weightPercentage > 0;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{feat.featureName}</span>
                        <span style={{ color: isPositive ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                          {isPositive ? '+' : '-'}{pct}%
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(pct * 2, 100)}%`, borderRadius: 999, background: isPositive ? '#ef4444' : '#22c55e', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SHAP note */}
          <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: '#818cf8' }}>AI Confidence: {Math.round(riskAssessment.overallConfidenceScore * 100)}%</span>
            {' '}— Risk attribution computed using SHAP-based explainability aligned with ICMR/ADA/KDIGO clinical guidelines.
          </div>
        </div>
      </div>

      <GuidelineDrawer />
    </div>
  );
}
