import React, { useState, useRef } from 'react';
import { Mic, Send, AlertTriangle, Activity, PhoneCall, Building2, Calendar, CheckCircle2, Bot, Watch, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { AgentPipelineResult, AgentStatus } from '../../types';

export const SmartIntakeChat: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'system', text: string }[]>([
    { role: 'assistant', text: "Hello! 👋 I am your HealthSense AI Assistant. You can chat with me, tap the microphone to speak, or tap 'Analyze Smartwatch Telemetry' to evaluate your live heart rate, body temp, and blood pressure!" }
  ]);

  // Pipeline state
  const [pipelineState, setPipelineState] = useState<{
    intake: AgentStatus;
    triage: AgentStatus;
    orchestrator: AgentStatus;
    empathy: AgentStatus;
  }>({
    intake: 'idle',
    triage: 'idle',
    orchestrator: 'idle',
    empathy: 'idle'
  });

  const [result, setResult] = useState<AgentPipelineResult | null>(null);
  const [autoDispatchTriggered, setAutoDispatchTriggered] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Web Speech API Native Voice-to-Text Recognition
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser native voice recognition unavailable. You can type your message in the box below!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsRecording(false);
    }
  };

  const handleSmartwatchAnalysis = () => {
    const promptText = "Can you analyze my smartwatch data? My live telemetry shows Heart Rate 118 BPM, Temp 101.4 F, Blood Pressure 158/98 mmHg, SpO2 95%.";
    processUserPrompt(promptText);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    const userText = inputText;
    setInputText('');
    processUserPrompt(userText);
  };

  const processUserPrompt = async (userText: string) => {
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setResult(null);

    const textLower = userText.toLowerCase();

    // 2. GREETINGS AND CASUAL LIGHT TALK
    if (textLower === 'hi' || textLower === 'hello' || textLower.includes('how are you') || textLower.includes('good morning')) {
      setPipelineState({ intake: 'processing', triage: 'processing', orchestrator: 'processing', empathy: 'processing' });
      setTimeout(() => {
        const greetingResp = "Hello there! 👋 I am doing wonderful, thank you for asking! How are you feeling today? You can share how your day is going, ask medical questions, or tap 'Analyze Smartwatch Telemetry' to check your heart rate and body temp!";
        setPipelineState({ intake: 'complete', triage: 'complete', orchestrator: 'complete', empathy: 'complete' });
        setMessages(prev => [...prev, { role: 'assistant', text: greetingResp }]);
      }, 800);
      return;
    }

    // 3. REGULAR SYMPTOM PIPELINE
    setPipelineState({ intake: 'processing', triage: 'idle', orchestrator: 'idle', empathy: 'idle' });

    try {
      const response = await fetch('/api/agents/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userText,
          patientId: 'p-101'
        })
      });

      if (!response.ok) {
        throw new Error('Clinical Engine Unavailable - Real-time processing failed.');
      }

      const data: AgentPipelineResult = await response.json();
      setResult(data);
      setPipelineState({ intake: 'complete', triage: 'complete', orchestrator: 'complete', empathy: 'complete' });
      setMessages(prev => [...prev, { role: 'assistant', text: data.empathy.spokenText }]);

      if (data.empathy.audioBase64 && audioRef.current) {
        audioRef.current.src = `data:audio/mpeg;base64,${data.empathy.audioBase64}`;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    } catch (err: any) {
      console.error(err);
      setPipelineState({ intake: 'error', triage: 'error', orchestrator: 'error', empathy: 'error' });
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: err.message || 'Unable to connect to AI engine. Retrying...' 
      }]);
    }
  };

  const StatusIcon = ({ status }: { status: AgentStatus }) => {
    if (status === 'processing') return <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>;
    if (status === 'complete') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'error') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>;
  };

  // Emergency Lockdown UI for High-Risk Crisis
  if (result && result.triage.priority === 'HIGH') {
    return (
      <div className="fixed inset-0 z-50 bg-red-600 text-white flex flex-col p-8 overflow-y-auto">
        <audio ref={audioRef} />
        
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-4 text-white">
            <AlertTriangle className="w-16 h-16 animate-pulse" />
            <div>
              <h1 className="text-4xl font-bold">EMERGENCY PROTOCOL ACTIVATED</h1>
              <p className="text-xl text-red-100 mt-2">Suspected {result.triage.suspected_risk}</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Bot className="w-6 h-6" /> Assistant Instructions
            </h2>
            <p className="text-2xl leading-relaxed font-medium">"{result.empathy.spokenText}"</p>
          </div>

          {autoDispatchTriggered && (
            <div className="bg-white text-red-900 rounded-2xl p-6 shadow-2xl space-y-3">
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-600 animate-bounce" />
                Automatic Emergency Network Dispatch Triggered
              </h3>
              <p className="text-sm font-semibold">
                Smartwatch telemetry detected critical fever and blood pressure spike. The following emergency actions were executed automatically:
              </p>
              <div className="space-y-2 text-sm font-medium">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Primary Doctor (Dr. Arthur Pendelton) & City Hospital Network Notified</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Emergency Family Member Contact Sent Instant Twilio SMS Alert</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.orchestration.actions.map((act, idx) => (
              <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/20">
                <p className="font-bold text-lg">{act.action}</p>
                {act.details && <p className="text-sm text-red-100">{act.details}</p>}
              </div>
            ))}
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-4 bg-white text-red-700 font-extrabold rounded-2xl text-lg shadow-xl hover:bg-slate-100 transition"
          >
            Acknowledge & Return to Assistant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <audio ref={audioRef} />

      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base">Smart Intake & Sensor Assistant</h2>
            <p className="text-xs text-slate-400">Powered by NVIDIA NIM & Web Bluetooth Telemetry</p>
          </div>
        </div>

        {/* SMARTWATCH QUICK ANALYZER BUTTON */}
        <button
          onClick={handleSmartwatchAnalysis}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
        >
          <Watch className="w-4 h-4 animate-pulse" />
          Analyze Smartwatch Telemetry
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : msg.role === 'system'
                ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                : 'bg-white text-slate-900 border border-slate-200 rounded-tl-sm shadow-sm'
            }`}>
              <p className={`${msg.role === 'assistant' ? 'text-sm leading-relaxed' : 'text-sm'}`}>{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Pipeline Tracker */}
        {(pipelineState.intake !== 'idle' && !result) && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-80">
            <h4 className="font-bold text-slate-900 text-sm mb-4">Pipeline Status</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <StatusIcon status={pipelineState.intake} />
                <span className={pipelineState.intake === 'processing' ? 'text-blue-600 font-medium' : 'text-slate-600'}>
                  Smart Intake (Llama 8B)
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <StatusIcon status={pipelineState.triage} />
                <span className={pipelineState.triage === 'processing' ? 'text-blue-600 font-medium' : 'text-slate-600'}>
                  Clinical Reasoning (Llama 70B)
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <StatusIcon status={pipelineState.orchestrator} />
                <span className={pipelineState.orchestrator === 'processing' ? 'text-blue-600 font-medium' : 'text-slate-600'}>
                  Action Orchestrator
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <StatusIcon status={pipelineState.empathy} />
                <span className={pipelineState.empathy === 'processing' ? 'text-blue-600 font-medium' : 'text-slate-600'}>
                  Generating Response (TTS)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Native Web Speech Microphone Button */}
          <button 
            type="button"
            title="Click to speak (Voice Recognition)"
            className={`p-4 rounded-full transition-all cursor-pointer ${
              isRecording ? 'bg-red-600 text-white animate-bounce ring-4 ring-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={toggleRecording}
          >
            <Mic className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? "Listening to your voice..." : "Type 'hi', or 'can you analyze my smartwatch data'..."}
              className="w-full bg-slate-100 border-transparent rounded-2xl py-4 px-6 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
              disabled={pipelineState.intake === 'processing'}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!inputText.trim() || pipelineState.intake === 'processing'}
            className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};
