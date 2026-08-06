import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Copy,
  Check,
  BookOpen,
  Brain,
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Stethoscope,
  Pill,
  RefreshCw,
  Zap,
  ArrowRight,
  Info,
  ChevronRight,
  UserCheck,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { Patient } from '../../types';
import { streamMessage, healthCheck, ChatMessage, HealthCheckResult } from '../../services/llamaService';

interface EvidenceCard {
  title: string;
  value: string;
  status: 'critical' | 'warning' | 'normal' | 'info';
  source?: string;
}

interface SuggestedAction {
  action: string;
  urgency: 'High' | 'Routine';
  category: 'Lab' | 'Medication' | 'Referral' | 'Monitoring';
}

interface ClinicalDocumentDraft {
  type: 'SOAP' | 'DischargeSummary' | 'ReferralLetter' | 'FollowUpPlan' | 'None';
  title: string;
  content: string;
}

interface CopilotResponseData {
  executiveSummary: string;
  evidenceCards?: EvidenceCard[];
  clinicalReasoning?: string[];
  keyFindings?: string[];
  supportingFactors?: string[];
  suggestedActions?: SuggestedAction[];
  guidelineSummary?: string;
  clinicalDocumentDraft?: ClinicalDocumentDraft;
  // Markdown formatted streamed LLM content
  streamingContent?: string;
  error?: string;
}

interface CopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  timestamp: string;
  text?: string; // User message text or raw text
  data?: CopilotResponseData;
  isStreaming?: boolean;
}

interface Props {
  activePatient: Patient;
}

// Custom Rich Markdown Renderer Component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split lines to parse markdown elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    // Regex for bold **bold**, italic *italic*, inline code `code`
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Bold regex
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);

      if (boldMatch && (!codeMatch || boldMatch.index! < codeMatch.index!)) {
        const pre = remaining.slice(0, boldMatch.index);
        if (pre) parts.push(<span key={keyIdx++}>{pre}</span>);
        parts.push(
          <strong key={keyIdx++} className="font-extrabold text-indigo-400 dark:text-indigo-300">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index! + boldMatch[0].length);
      } else if (codeMatch) {
        const pre = remaining.slice(0, codeMatch.index);
        if (pre) parts.push(<span key={keyIdx++}>{pre}</span>);
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 bg-slate-800 text-amber-300 font-mono text-[11px] rounded border border-slate-700">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch.index! + codeMatch[0].length);
      } else {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }
    }
    return parts;
  };

  lines.forEach((line, idx) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${idx}`} className="my-2 p-3 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-2xl border border-slate-800 overflow-x-auto shadow-inner">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] pb-1 border-b border-slate-800 mb-2">
              <Terminal className="w-3 h-3" /> Code Block
            </div>
            <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Markdown Table parsing
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (cells.length > 0 && !cells.every((c) => c.match(/^:?-+:?$/))) {
        if (!inTable) inTable = true;
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      // Render accumulated table
      elements.push(
        <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-200 uppercase text-[10px] font-bold">
              <tr>
                {tableRows[0]?.map((th, i) => (
                  <th key={i} className="p-2.5 border-b border-slate-800">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/60 text-slate-300">
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/50">
                  {row.map((td, cIdx) => (
                    <td key={cIdx} className="p-2.5">{parseInlineMarkdown(td)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableRows = [];
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-sm font-extrabold text-indigo-400 pt-2 pb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {parseInlineMarkdown(line.replace('### ', ''))}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={idx} className="text-xs font-bold text-slate-200 pt-2 pb-0.5 uppercase tracking-wider">
          {parseInlineMarkdown(line.replace('#### ', ''))}
        </h4>
      );
    } else if (line.startsWith('# ') || line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-base font-black text-white pt-3 pb-1 border-b border-slate-800">
          {parseInlineMarkdown(line.replace(/^#+\s/, ''))}
        </h2>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 pl-2 py-0.5">
          <span className="text-indigo-400 font-bold">•</span>
          <span>{parseInlineMarkdown(line.replace(/^[-*]\s/, ''))}</span>
        </div>
      );
    } else if (line.trim().match(/^\d+\.\s/)) {
      const match = line.trim().match(/^(\d+)\.\s(.*)/);
      elements.push(
        <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 pl-2 py-0.5">
          <span className="px-1.5 py-0.2 bg-indigo-950 text-indigo-300 rounded text-[10px] font-mono font-bold">{match?.[1]}</span>
          <span>{parseInlineMarkdown(match?.[2] || '')}</span>
        </div>
      );
    } else if (line.trim()) {
      elements.push(
        <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed py-1">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{elements}</div>;
};

export const DoctorAiAssistant: React.FC<Props> = ({ activePatient }) => {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [providerHealth, setProviderHealth] = useState<HealthCheckResult | null>(null);

  // Store conversation history PER PATIENT (patient.id)
  const [histories, setHistories] = useState<Record<string, CopilotMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [histories, isGenerating]);

  // Check Llama Provider Health on initial mount
  useEffect(() => {
    healthCheck().then(setProviderHealth);
  }, []);

  // Initialize patient conversation if empty
  useEffect(() => {
    if (!histories[activePatient.id]) {
      const initialMessage: CopilotMessage = {
        id: `init-${activePatient.id}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: {
          executiveSummary: `HealthSense Llama 3.3 Copilot active for ${activePatient.name} (MRN #${activePatient.mrn}, Age ${activePatient.age}, ${activePatient.gender}). Vitals & lab panel loaded. Ready for clinical query, guideline checks, differential considerations, or EMR document drafts.`,
          evidenceCards: [
            { title: 'HbA1c Glycemia', value: `${activePatient.vitals.hba1c}%`, status: activePatient.vitals.hba1c >= 8.0 ? 'critical' : activePatient.vitals.hba1c >= 6.5 ? 'warning' : 'normal', source: 'EHR Lab Panel' },
            { title: 'Blood Pressure', value: `${activePatient.vitals.bpSystolic}/${activePatient.vitals.bpDiastolic} mmHg`, status: activePatient.vitals.bpSystolic >= 140 ? 'warning' : 'normal', source: 'Clinical Vitals' },
            { title: 'CDSS Risk Index', value: `${activePatient.riskScore}% (${activePatient.riskLevel})`, status: activePatient.riskLevel === 'High' ? 'critical' : 'warning', source: 'XGBoost ML' },
          ],
          keyFindings: [
            `Active Diagnosis: ${activePatient.conditions.join(', ')}`,
            `Glycemic status: ${activePatient.vitals.hba1c >= 8.0 ? 'Uncontrolled (HbA1c > 8.0%)' : 'Sub-target'}`,
            `Specialist status: ${activePatient.pendingReferral ? `Referral pending (${activePatient.referralSpecialist})` : 'Stable outpatient'}`,
          ],
          guidelineSummary: 'ADA Standards of Care 2026 & KDIGO CKD Guidelines: Dual cardiometabolic evaluation recommended for HbA1c > 8.0% with Stage 2 HTN.',
        },
      };

      setHistories((prev) => ({
        ...prev,
        [activePatient.id]: [initialMessage],
      }));
    }
  }, [activePatient.id]);

  const currentMessages = histories[activePatient.id] || [];

  const quickPrompts = [
    { label: 'Why is diabetes risk high?', text: `Why is diabetes risk high for ${activePatient.name}? Explain risk factors & SHAP values.` },
    { label: 'What additional tests should I order?', text: `What additional diagnostic tests should I order for ${activePatient.name}?` },
    { label: 'Explain elevated creatinine & renal risk', text: `Explain renal risk, eGFR, and elevated creatinine for ${activePatient.name}.` },
    { label: 'Generate SOAP note', text: `Generate a complete EMR SOAP note for ${activePatient.name}.` },
    { label: 'Summarize this patient', text: `Summarize clinical history, vitals, and progression risk for ${activePatient.name}.` },
    { label: 'Detect potential drug interactions', text: `Detect potential drug interactions and renal/hepatic contraindications for ${activePatient.name}.` },
    { label: 'Generate discharge summary', text: `Generate an outpatient discharge / encounter summary for ${activePatient.name}.` },
    { label: 'Guideline summary (ADA / KDIGO)', text: `Provide a concise guideline summary for ${activePatient.name} based on ADA 2026, KDIGO, and ACC/AHA protocols.` },
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || query;
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    // Create placeholder AI message for streaming
    const aiMsgId = `ai-${Date.now()}`;
    const aiMsgPlaceholder: CopilotMessage = {
      id: aiMsgId,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      data: {
        executiveSummary: '',
        streamingContent: '',
      },
    };

    const newHistory = [...currentMessages, userMsg];

    setHistories((prev) => ({
      ...prev,
      [activePatient.id]: [...newHistory, aiMsgPlaceholder],
    }));

    if (!customPrompt) setQuery('');
    setIsGenerating(true);

    try {
      // Format chat messages for backend API
      const formattedChatMessages: ChatMessage[] = newHistory.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || (m.data ? m.data.streamingContent || m.data.executiveSummary : ''),
      }));

      // Stream response using llamaService
      await streamMessage(
        formattedChatMessages,
        activePatient,
        (chunkText) => {
          setHistories((prev) => {
            const patientMsgs = prev[activePatient.id] || [];
            return {
              ...prev,
              [activePatient.id]: patientMsgs.map((msg) =>
                msg.id === aiMsgId
                  ? {
                      ...msg,
                      isStreaming: true,
                      data: {
                        ...msg.data,
                        executiveSummary: chunkText,
                        streamingContent: chunkText,
                      },
                    }
                  : msg
              ),
            };
          });
        }
      );

      // Finalize message once streaming completes
      setHistories((prev) => {
        const patientMsgs = prev[activePatient.id] || [];
        return {
          ...prev,
          [activePatient.id]: patientMsgs.map((msg) =>
            msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
          ),
        };
      });
    } catch (err: any) {
      console.error('Llama Copilot request error:', err);
      setHistories((prev) => {
        const patientMsgs = prev[activePatient.id] || [];
        return {
          ...prev,
          [activePatient.id]: patientMsgs.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  isStreaming: false,
                  data: {
                    executiveSummary: `⚠️ Unable to connect to Llama API provider. Error: ${err?.message || 'Network Timeout'}. Click retry below.`,
                    error: err?.message,
                  },
                }
              : msg
          ),
        };
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                Llama 3.3 Production CDSS Pipeline
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Doctor AI Copilot
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            OpenAI-Compatible Llama reasoning engine. Evidence synthesizer, guideline auditor, and EMR clinical document generator.
          </p>
        </div>

        {/* Provider Status & Active Patient */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {providerHealth && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-[10px] font-bold text-slate-300">
              <span className={`w-2 h-2 rounded-full ${providerHealth.hasKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>Provider: {providerHealth.provider} ({providerHealth.model})</span>
            </div>
          )}

          <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl flex items-center gap-3">
            <img
              src={activePatient.avatar}
              alt={activePatient.name}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-400 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-white">{activePatient.name}</span>
                <span className="text-[10px] font-mono text-slate-400">#{activePatient.mrn}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {activePatient.age}y {activePatient.gender} • HbA1c {activePatient.vitals.hba1c}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK PROMPT ACTION BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Physician Action Queries for {activePatient.name}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              disabled={isGenerating}
              onClick={() => handleSend(item.text)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-xl text-xs font-bold transition text-left flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT LOG AREA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm min-h-[450px] flex flex-col justify-between space-y-6">
        <div className="space-y-6 overflow-y-auto max-h-[650px] pr-1">
          {currentMessages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.sender === 'user' ? (
                /* USER MESSAGE BUBBLE */
                <div className="flex justify-end">
                  <div className="max-w-xl bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none text-xs sm:text-sm font-semibold shadow-md space-y-1">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[10px] text-indigo-200 block text-right font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              ) : (
                /* AI COPILOT STRUCTURED / STREAMING RESPONSE CARD */
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Response Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          Doctor AI Copilot
                          {msg.isStreaming && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </span>
                        <p className="text-[10px] text-slate-400">Synthesized at {msg.timestamp}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopyText(
                            msg.data?.streamingContent || msg.data?.executiveSummary || '',
                            msg.id
                          )
                        }
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {msg.data?.error && (
                        <button
                          onClick={() => handleSend(currentMessages[currentMessages.length - 2]?.text)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Markdown Streamed Content */}
                  {(msg.data?.streamingContent || msg.data?.executiveSummary) && (
                    <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-slate-100 font-sans leading-relaxed">
                      <MarkdownRenderer content={msg.data.streamingContent || msg.data.executiveSummary || ''} />
                    </div>
                  )}

                  {/* Evidence Cards Grid */}
                  {msg.data?.evidenceCards && msg.data.evidenceCards.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-500" /> Key Clinical Evidence Cards
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {msg.data.evidenceCards.map((card, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                              card.status === 'critical'
                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                                : card.status === 'warning'
                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 block">{card.title}</span>
                              <span className="font-black text-sm block mt-0.5">{card.value}</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                card.status === 'critical'
                                  ? 'bg-rose-500 text-white'
                                  : card.status === 'warning'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-emerald-500 text-white'
                              }`}
                            >
                              {card.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formatted EMR Document Draft (SOAP / Discharge) */}
                  {msg.data?.clinicalDocumentDraft && msg.data.clinicalDocumentDraft.content && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          {msg.data.clinicalDocumentDraft.title}
                        </span>

                        <button
                          onClick={() => handleCopyText(msg.data!.clinicalDocumentDraft!.content, `doc-${msg.id}`)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedId === `doc-${msg.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Copied to Clipboard
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Document to EMR
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-4 bg-slate-900 text-emerald-300 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-800 shadow-inner max-h-96">
                        {msg.data.clinicalDocumentDraft.content}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />

          {isGenerating && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl flex items-center gap-3 text-xs text-indigo-700 dark:text-indigo-300 font-bold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
              <span>Doctor AI Copilot is synthesizing evidence and streaming Llama tokens...</span>
            </div>
          )}
        </div>

        {/* MEDICAL SYSTEM PROMPT NOTICE DISCLAIMER */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Clinical Decision Support Notice:</strong> Doctor AI Copilot provides evidence synthesis and decision support. It does not replace licensed physicians. Maintain professional clinical judgement.
          </span>
        </div>

        {/* INPUT QUERY BAR */}
        <div className="pt-2 flex gap-2">
          <input
            type="text"
            placeholder={`Ask Doctor AI Copilot about ${activePatient.name}...`}
            value={query}
            disabled={isGenerating}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={isGenerating || !query.trim()}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Execute Query</span>
          </button>
        </div>
      </div>
    </div>
  );
};
