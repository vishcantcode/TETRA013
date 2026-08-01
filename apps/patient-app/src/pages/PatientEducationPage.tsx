import React from 'react';
import { BookOpen, Volume2, Printer, AlertOctagon, Salad, Activity, CheckSquare, Heart, Clock } from 'lucide-react';
import { useCDSS, SupportedLanguage } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';

export default function PatientEducationPage() {
  const { educationPlan, educationLanguage, setEducationLanguage, patient, riskAssessment } = useCDSS();

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(educationPlan.audioGuidance.scriptText);
      utterance.lang = educationLanguage === 'hi' ? 'hi-IN' : educationLanguage === 'gu' ? 'gu-IN' : educationLanguage === 'ta' ? 'ta-IN' : educationLanguage === 'mr' ? 'mr-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Playing Audio Guidance Script (${educationLanguage.toUpperCase()}): ${educationPlan.audioGuidance.scriptText}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in">
      <TopNavigation />

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen style={{ width: 22, height: 22, color: '#38bdf8' }} />
            Personalized Vernacular Patient Education & Lifestyle Plan
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Tailored Indian dietary guidance (Millets, Ragi, Dal), physical activity goals, and printable checklists
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={playAudio}>
            <Volume2 style={{ width: 14, height: 14, color: '#38bdf8' }} /> Listen Audio
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer style={{ width: 14, height: 14 }} /> Print Education Sheet
          </button>
        </div>
      </div>

      {/* Vernacular Language Switcher Bar (EN, HI, GU, TA, MR) */}
      <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Select Vernacular Language:</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['en', 'hi', 'gu', 'ta', 'mr'] as SupportedLanguage[]).map(lang => {
            const labels: Record<SupportedLanguage, string> = {
              en: 'English',
              hi: 'हिंदी (Hindi)',
              gu: 'ગુજરાતી (Gujarati)',
              ta: 'தமிழ் (Tamil)',
              mr: 'मराठी (Marathi)'
            };
            const isSelected = educationLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => setEducationLanguage(lang)}
                style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: isSelected ? 'linear-gradient(135deg, #2563eb, #38bdf8)' : 'rgba(255,255,255,0.06)',
                  color: isSelected ? '#fff' : '#94a3b8',
                  border: `1px solid ${isSelected ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {labels[lang]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Guidance Card */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
            Grade {educationPlan.summary.readingGradeLevel} Reading Level
          </span>
          <span style={{ fontSize: 11, color: '#64748b' }}>Language: {educationLanguage.toUpperCase()}</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{educationPlan.summary.headline}</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{educationPlan.summary.summaryText}</p>
        <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(56,189,248,0.04)', borderLeft: '3px solid #38bdf8' }}>
          <strong style={{ fontSize: 12, color: '#38bdf8' }}>Key Action Message: </strong>
          <span style={{ fontSize: 12, color: '#fff' }}>{educationPlan.summary.keyActionMessage}</span>
        </div>
      </div>

      {/* Indian Dietary Plan (Millets, Dal, Ragi) & Physical Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Salad style={{ width: 16, height: 16, color: '#22c55e' }} />
            Indian Dietary Recommendations (Low GI)
          </h4>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Category: {educationPlan.lifestylePlan.diet.category}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>Recommended Indian Superfoods:</span>
            <p style={{ fontSize: 12, color: '#fff', lineHeight: 1.5 }}>
              Ragi Dosa, Bajra Porridge, Foxtail Millet (Kangni), Moong & Chana Dal, Palak, Bitter Gourd (Karela), and Methi.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>Foods to Limit / Avoid:</span>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              Refined white rice, maida, sweets, fried snacks (samosas/pakoras), and sugary soft drinks.
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity style={{ width: 16, height: 16, color: '#38bdf8' }} />
            Daily Walking & Exercise Goals
          </h4>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            Goal: {educationPlan.lifestylePlan.exercise.weeklyFrequency} ({educationPlan.lifestylePlan.exercise.durationMinutesPerSession} mins/session)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckSquare style={{ width: 16, height: 16, color: '#38bdf8' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Brisk Walking Goal</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>5,000 - 7,000 steps daily (preferably 30 mins after meals)</div>
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock style={{ width: 16, height: 16, color: '#f59e0b' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Medication Schedule Routine</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Take prescribed medications with morning & evening meals as directed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Red Flag Warning Card */}
      <div className="card" style={{ padding: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertOctagon style={{ width: 18, height: 18 }} /> Red Flag Warning Symptoms — Seek Immediate PHC Care
        </h4>
        <ul style={{ paddingLeft: 20, fontSize: 12, color: '#fca5a5', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {educationPlan.actionPlan.redFlagSymptoms.map((flag, idx) => (
            <li key={idx}>{flag}</li>
          ))}
          <li>Sudden severe chest pressure, cold sweats, or breathlessness</li>
          <li>Blood pressure exceeding 160/100 mmHg with severe dizziness</li>
        </ul>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', paddingTop: 8, borderTop: '1px solid rgba(239,68,68,0.2)' }}>
          Emergency Contact: Contact nearest Primary Health Center or dial 108 immediately.
        </p>
      </div>
    </div>
  );
}
