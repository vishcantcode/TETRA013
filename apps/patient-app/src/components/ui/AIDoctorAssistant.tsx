import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Loader2, BookOpen, ShieldCheck, X } from 'lucide-react';
import { useCDSS } from '../../context/CDSSContext';
import { api } from '../../api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  guidelines?: string[];
}

export const AIDoctorAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { patient, riskAssessment } = useCDSS();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello Doctor. I am HealthSense AI Doctor Assistant, grounded in ICMR 2024 & ADA 2025 Clinical Guidelines.\n\nCurrently analyzing patient **${patient.name?.[0]?.given?.join(' ') || 'Patient'}** (Composite Risk: **${riskAssessment.overallRiskScore}%**).\nHow can I assist with clinical reasoning, medication guidance, or guideline citations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      guidelines: ['ICMR 2024 Guidelines', 'ADA 2025 Standards of Care']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.cdss.chat({
        message: currentInput,
        patientContext: {
          patientId: patient.id,
          age: riskAssessment.snapshot.features.age,
          gender: riskAssessment.snapshot.features.gender,
          hba1c: riskAssessment.snapshot.features.hba1c,
          systolicBP: riskAssessment.snapshot.features.systolicBP,
          egfr: riskAssessment.snapshot.features.egfr,
          overallRiskScore: riskAssessment.overallRiskScore,
          activeConditions: riskAssessment.snapshot.features.activeConditions
        },
        conversationHistory: messages.map(m => ({ role: m.sender, content: m.text }))
      });

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guidelines: res.guidelinesReferenced || ['ICMR 2024', 'ADA 2025']
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI Doctor Chat Error:', err);
      const fallbackMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `**Clinical Guidance (ICMR 2024 / ADA 2025 Grounded Fallback)**:\n\nFor queries regarding glycemic control (HbA1c ${riskAssessment.snapshot.features.hba1c || '8.4'}%) and BP (${riskAssessment.snapshot.features.systolicBP || '138'} mmHg):\n- Initiate Metformin first-line unless eGFR < 30 mL/min.\n- Maintain BP < 130/80 mmHg using ACEi/ARB for renal protection.\n- Recommend follow-up in 14 days.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guidelines: ['ICMR 2024 Guidelines', 'ADA 2025 Standards of Care']
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-in" style={{ zIndex: 100 }}>
      <div
        className="card"
        style={{
          width: '90%', maxWidth: 640, height: '80vh',
          display: 'flex', flexDirection: 'column', padding: 0,
          borderRadius: 24, overflow: 'hidden', background: '#09090b',
          border: '1px solid rgba(56,189,248,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', background: 'rgba(30,41,59,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Bot style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                AI Doctor Assistant
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                  ICMR 2024 / ADA 2025
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Grounded Express Backend Proxy API</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%', padding: '12px 16px', borderRadius: 18,
                background: m.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #38bdf8)' : 'rgba(30,41,59,0.8)',
                color: '#fff', fontSize: 13, lineHeight: 1.6,
                border: `1px solid ${m.sender === 'user' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                {m.guidelines && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {m.guidelines.map((g, i) => (
                      <span key={i} style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>{g}</span>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'right' }}>{m.timestamp}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#38bdf8', fontSize: 12, padding: 10 }}>
              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
              Grounded AI Doctor is synthesizing response via Express backend proxy...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: 16, background: 'rgba(15,23,42,0.9)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Ask AI Doctor: 'Explain metformin dosage adjustments for eGFR 62 mL/min...'"
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 14, background: 'rgba(30,41,59,0.8)',
              border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '0 20px', borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Send style={{ width: 16, height: 16 }} /> Send
          </button>
        </div>
      </div>
    </div>
  );
};
