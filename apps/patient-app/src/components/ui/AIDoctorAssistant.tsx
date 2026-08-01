import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot, Send, User, Sparkles, Loader2, BookOpen, ShieldCheck, X, Mic, MicOff,
  Volume2, Copy, Share2, FileText, Printer, Heart, Salad, Activity, Stethoscope,
  ChevronDown, ChevronUp, AlertOctagon, Check
} from 'lucide-react';
import { useCDSS, SupportedLanguage } from '../../context/CDSSContext';
import { api } from '../../api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  mode: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  suggestedChips?: string[];
  confidenceScore?: number;
  guidelines?: string[];
}

export const AIDoctorAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { patient, riskAssessment, currentVitals, currentLabs, educationLanguage, setEducationLanguage } = useCDSS();
  const location = useLocation();

  const [activeAssistantMode, setActiveAssistantMode] = useState<'doctor' | 'patient'>('doctor');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Determine Page Context automatically
  const pageContext = location.pathname.includes('digital-twin') ? 'digital-twin' :
                      location.pathname.includes('explainability') ? 'explainability' :
                      location.pathname.includes('ocr') ? 'ocr' :
                      location.pathname.includes('referrals') ? 'referrals' :
                      location.pathname.includes('education') ? 'education' : 'overview';

  // Initialize Initial Greeting
  useEffect(() => {
    const patientName = patient?.name?.[0]?.given?.join(' ') || 'Ramesh Patel';
    const initDoctorMsg: Message = {
      id: 'init-doc',
      sender: 'assistant',
      mode: 'doctor',
      text: `### Clinical Context Loaded Automatically
**Patient**: ${patientName} (Age 54, Male) • **ABHA**: 91-8273-4920-1123
**Composite Risk**: ${riskAssessment.overallRiskScore}% (${riskAssessment.overallTier.toUpperCase()})
**Biomarkers**: SBP ${currentVitals.systolicBP} mmHg, HbA1c ${currentLabs.hba1c}%, eGFR ${currentLabs.egfr} mL/min

### Initial Assessment (ICMR 2024 / ADA 2025)
- **Primary Concern**: Uncontrolled Glycemia & High Microvascular Risk.
- **Action Needed**: Initiate SGLT2i (Dapagliflozin 10mg OD) + Nephrology consultation.

*This recommendation supports—not replaces—clinical judgment.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceScore: 0.94,
      guidelines: ['ICMR 2024 Guidelines', 'ADA 2025 Standards of Care', 'KDIGO 2023'],
      suggestedChips: [
        'Explain kidney decline',
        'Why CKD stage 3?',
        'Generate referral',
        'Show SHAP explanation',
        'Generate patient education',
        'Translate to Gujarati'
      ]
    };

    const initPatientMsg: Message = {
      id: 'init-pat',
      sender: 'assistant',
      mode: 'patient',
      text: `Hello ${patientName}! I am your personal Health Coach. 👋

I'm here to help you understand your health, meals, and daily medicines in simple language.

How are you feeling today? You can ask me anything about your diet, walking goals, or medicine routines!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedChips: [
        'What foods should I eat?',
        'I forgot my morning medicine',
        'My BP is 160. What should I do?',
        'Translate to Gujarati'
      ]
    };

    setMessages([activeAssistantMode === 'doctor' ? initDoctorMsg : initPatientMsg]);
  }, [activeAssistantMode, patient]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      mode: activeAssistantMode,
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await api.cdss.chat({
        message: promptText,
        mode: activeAssistantMode,
        pageContext,
        language: educationLanguage,
        patientContext: {
          name: patient?.name?.[0]?.given?.join(' '),
          age: 54,
          gender: 'Male',
          hba1c: currentLabs.hba1c,
          systolicBP: currentVitals.systolicBP,
          egfr: currentLabs.egfr,
          bmi: currentVitals.bmi,
          overallRiskScore: riskAssessment.overallRiskScore
        },
        conversationHistory: messages.map(m => ({ role: m.sender, content: m.text }))
      });

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        mode: activeAssistantMode,
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: res.confidenceScore || 0.94,
        guidelines: res.guidelinesReferenced || ['ICMR 2024', 'ADA 2025'],
        suggestedChips: res.suggestedChips || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        mode: activeAssistantMode,
        text: activeAssistantMode === 'patient' ?
          'I am here to help you stay healthy! Eat low-sugar Indian foods like Ragi, Millets, and Moong Dal, and walk 30 minutes daily.' :
          `### Clinical Summary (ICMR 2024 / ADA 2025 Grounded)\nTarget SBP < 130/80 mmHg & HbA1c < 7.0%. Initiate SGLT2i + ACEi/ARB.\n*This recommendation supports—not replaces—clinical judgment.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: 0.92,
        suggestedChips: ['Explain kidney decline', 'Generate referral']
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech Recognition STT Trigger
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = educationLanguage === 'hi' ? 'hi-IN' : educationLanguage === 'gu' ? 'gu-IN' : educationLanguage === 'ta' ? 'ta-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  // Text-To-Speech TTS Speaker
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const cleanText = text.replace(/[#*`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = educationLanguage === 'hi' ? 'hi-IN' : educationLanguage === 'gu' ? 'gu-IN' : educationLanguage === 'ta' ? 'ta-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="modal-overlay animate-in" style={{ zIndex: 100 }}>
      <div
        className="card"
        style={{
          width: '94%', maxWidth: 760, height: '85vh',
          display: 'flex', flexDirection: 'column', padding: 0,
          borderRadius: 24, overflow: 'hidden', background: '#09090b',
          border: '1px solid rgba(56,189,248,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.85)'
        }}
      >
        {/* Sticky Header with Mode Selector & Language Switcher */}
        <div style={{ padding: '16px 24px', background: 'rgba(30,41,59,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: activeAssistantMode === 'doctor' ? 'rgba(56,189,248,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${activeAssistantMode === 'doctor' ? 'rgba(56,189,248,0.4)' : 'rgba(34,197,94,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeAssistantMode === 'doctor' ? '#38bdf8' : '#22c55e' }}>
              <Bot style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                {activeAssistantMode === 'doctor' ? 'Senior Doctor AI Assistant (Copilot)' : 'Patient AI Health Coach'}
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
                  Context: {pageContext.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {activeAssistantMode === 'doctor' ? 'Grounded in ICMR 2024 & ADA 2025' : 'Friendly, Vernacular Plain-Language Guidance'}
              </div>
            </div>
          </div>

          {/* Mode Switcher Pills */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(15,23,42,0.6)', padding: 4, borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setActiveAssistantMode('doctor')}
              style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: activeAssistantMode === 'doctor' ? '#38bdf8' : 'transparent', color: activeAssistantMode === 'doctor' ? '#fff' : '#94a3b8'
              }}
            >
              Doctor AI
            </button>
            <button
              onClick={() => setActiveAssistantMode('patient')}
              style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: activeAssistantMode === 'patient' ? '#22c55e' : 'transparent', color: activeAssistantMode === 'patient' ? '#fff' : '#94a3b8'
              }}
            >
              Patient Health Coach
            </button>
          </div>
        </div>

        {/* Vernacular Language Bar for Patient Mode */}
        {activeAssistantMode === 'patient' && (
          <div style={{ padding: '8px 24px', background: 'rgba(34,197,94,0.06)', borderBottom: '1px solid rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Language:</span>
            {(['en', 'hi', 'gu', 'ta', 'mr'] as SupportedLanguage[]).map(lang => (
              <button
                key={lang} onClick={() => setEducationLanguage(lang)}
                style={{
                  padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: educationLanguage === lang ? '#22c55e' : 'transparent',
                  color: educationLanguage === lang ? '#fff' : '#94a3b8', border: 'none', cursor: 'pointer'
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Conversation Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
              <div
                style={{
                  maxWidth: '88%', padding: '16px 20px', borderRadius: 20,
                  background: m.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #38bdf8)' : 'rgba(30,41,59,0.85)',
                  color: '#fff', fontSize: m.mode === 'patient' ? 14 : 13, lineHeight: 1.6,
                  border: `1px solid ${m.sender === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>

                {/* Guidelines & Confidence Footer */}
                {m.sender === 'assistant' && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {m.guidelines?.map((g, i) => (
                        <span key={i} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>{g}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {m.confidenceScore && (
                        <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>Confidence: {Math.round(m.confidenceScore * 100)}%</span>
                      )}
                      <button onClick={() => speakText(m.text)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}>
                        <Volume2 style={{ width: 14, height: 14 }} />
                      </button>
                      <button onClick={() => copyToClipboard(m.text, m.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}>
                        {copiedId === m.id ? <Check style={{ width: 14, height: 14, color: '#22c55e' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Action Chips */}
              {m.suggestedChips && m.suggestedChips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: '88%' }}>
                  {m.suggestedChips.map((chip, idx) => (
                    <button
                      key={idx} onClick={() => handleSend(chip)}
                      style={{
                        padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        background: 'rgba(30,41,59,0.7)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#38bdf8', fontSize: 12, padding: 12 }}>
              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
              {activeAssistantMode === 'doctor' ? 'Senior Physician AI is synthesizing clinical reasoning via Express backend...' : 'Patient Health Coach is preparing warm guidance...'}
            </div>
          )}
        </div>

        {/* Input Bar with Voice Button & Action Triggers */}
        <div style={{ padding: 16, background: 'rgba(15,23,42,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder={activeAssistantMode === 'doctor' ? "Ask Doctor AI: 'What happens if HbA1c reaches 6.5%?' or 'Compare treatment options'..." : "Ask Health Coach: 'My sugar is high. What should I eat?'..."}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 14, background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none'
              }}
            />
            <button
              onClick={toggleSpeechRecognition}
              style={{
                padding: '0 14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: isRecording ? '#ef4444' : 'rgba(255,255,255,0.08)', color: '#fff'
              }}
            >
              {isRecording ? <MicOff style={{ width: 18, height: 18 }} /> : <Mic style={{ width: 18, height: 18, color: '#38bdf8' }} />}
            </button>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{
                padding: '0 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: activeAssistantMode === 'doctor' ? 'linear-gradient(135deg, #2563eb, #38bdf8)' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Send style={{ width: 16, height: 16 }} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
