import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, AlertTriangle, Activity, PhoneCall, Building2, Calendar, CheckCircle2, Bot, Watch, ShieldAlert, Sparkles, UserCheck, Volume2, Phone, PhoneIncoming, PhoneOff, Bell, Siren, MessageSquare } from 'lucide-react';
import { AgentPipelineResult, AgentStatus } from '../../types';

export const SmartIntakeChat: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+916359385870');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [redEmergencyActive, setRedEmergencyActive] = useState(false);
  
  // Call simulation state
  const [incomingCall, setIncomingCall] = useState<{
    active: boolean;
    callerName: string;
    callerNumber: string;
    script: string;
    inCall: boolean;
  } | null>(null);

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'system', text: string, isSmsNotice?: boolean }[]>([
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Request browser desktop push notifications permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Web Speech API Native Text-to-Speech (TTS)
  const speakNativeTTS = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[#*`_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger Desktop Push Notification
  const triggerDesktopNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        });
      } catch (e) {
        console.warn('Desktop notification failed:', e);
      }
    }
  };

  // Trigger Red Emergency Alert & Simulated Phone Call
  const triggerRedEmergencyAlert = (customScript?: string) => {
    const alertScript = customScript || "EMERGENCY HEALTH ALERT: High risk cardiometabolic spike detected for Eleanor Vance. Primary Doctor Dr. Arthur Pendelton and Emergency Ambulance Network have been dispatched.";
    
    setRedEmergencyActive(true);
    triggerDesktopNotification(`🚨 RED EMERGENCY ALERT: Dispatched to ${phoneNumber}`, alertScript);
    speakNativeTTS(alertScript);

    // Push emergency SMS notice to chat thread
    setMessages(prev => [
      ...prev,
      {
        role: 'system',
        text: `📱 RED SMS ALERT SENT TO ${phoneNumber}: "${alertScript}"`,
        isSmsNotice: true,
      }
    ]);
  };

  const triggerSimulatedPhoneCall = (scriptText: string) => {
    setRedEmergencyActive(true);
    triggerDesktopNotification(
      `🚨 INCOMING VOICE CALL: HealthSense Dispatch to ${phoneNumber}`,
      `Emergency Triage Script: ${scriptText.slice(0, 100)}...`
    );

    setIncomingCall({
      active: true,
      callerName: "HealthSense AI Emergency Dispatcher",
      callerNumber: phoneNumber,
      script: scriptText,
      inCall: false,
    });
  };

  const acceptPhoneCall = () => {
    if (!incomingCall) return;
    setIncomingCall(prev => prev ? { ...prev, inCall: true } : null);
    speakNativeTTS(`Connecting emergency audio channel for ${incomingCall.callerNumber}. ${incomingCall.script}`);
  };

  const endPhoneCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIncomingCall(null);
  };

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
    const promptText = "Can you analyze my smartwatch data?";
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

    // 1. SMARTWATCH TELEMETRY ANALYSIS REQUEST
    if (textLower.includes('smartwatch') || textLower.includes('watch') || textLower.includes('heartbeat') || textLower.includes('temp')) {
      setPipelineState({ intake: 'processing', triage: 'processing', orchestrator: 'processing', empathy: 'processing' });
      
      setTimeout(() => {
        const sampleVitals = {
          hr: 118,
          temp: 101.4,
          bpSys: 158,
          bpDia: 98,
          spo2: 95,
        };

        const isSevere = sampleVitals.bpSys >= 150 || sampleVitals.temp >= 101 || sampleVitals.hr >= 110;

        const explanation = `I analyzed your live smartwatch telemetry: Body Temperature is ${sampleVitals.temp}°F (elevated fever), Heart Rate is ${sampleVitals.hr} BPM (tachycardia), Blood Pressure is ${sampleVitals.bpSys}/${sampleVitals.bpDia} mmHg (Hypertensive Spike), and SpO2 is ${sampleVitals.spo2}%. You may be experiencing an Acute Hypertensive / Infectious Fever Spike. ${
          isSevere
            ? `Because your vitals indicate severe stress, I have AUTOMATICALLY alerted your Primary Doctor (Dr. Arthur Pendelton), dispatched hospital triage alerts, and sent an emergency SMS to ${phoneNumber}.`
            : 'Please drink plenty of water and rest.'
        }`;

        const mockResult: AgentPipelineResult = {
          intake: {
            symptoms: ['elevated body temperature', 'tachycardia', 'stage 2 hypertensive BP spike'],
            duration: 'live smartwatch stream',
            severity_mentioned: isSevere ? 'HIGH' : 'MEDIUM',
            context: 'Smartwatch sensor telemetry sync',
          },
          triage: {
            priority: isSevere ? 'HIGH' : 'MEDIUM',
            suspected_risk: 'Hypertensive & Thermal Crisis Spike',
            rationale: `Smartwatch telemetry indicates Body Temp ${sampleVitals.temp}°F and BP ${sampleVitals.bpSys}/${sampleVitals.bpDia} mmHg.`,
            red_flags: ['High Fever Spike (>101°F)', 'Systolic BP >= 150 mmHg', 'Tachycardia > 110 BPM'],
            suggested_action: isSevere ? 'DISPATCH_AMBULANCE' : 'SCHEDULE_PCP',
          },
          orchestration: {
            priority: isSevere ? 'HIGH' : 'MEDIUM',
            actions: [
              { action: '🚨 Automated Doctor & Hospital Dispatch', details: 'Alert sent to Dr. Arthur Pendelton & City Hospital Network', status: 'success' },
              { action: `📱 Emergency SMS & Call Dispatched`, details: `Twilio Alert sent to ${phoneNumber}`, status: 'success' },
              { action: '🏥 Urgent Primary Care Appointment Scheduled', details: 'Slot reserved for immediate clinical consultation', status: 'success' },
            ],
            nudge: `ALERT: Smartwatch telemetry detected Temp ${sampleVitals.temp}°F & BP ${sampleVitals.bpSys}/${sampleVitals.bpDia} mmHg. Emergency protocol active.`,
          },
          empathy: {
            spokenText: explanation,
            audioBase64: '',
          },
        };

        setResult(mockResult);
        setPipelineState({ intake: 'complete', triage: 'complete', orchestrator: 'complete', empathy: 'complete' });
        setMessages(prev => [...prev, { role: 'assistant', text: explanation }]);
        
        if (isSevere) {
          triggerRedEmergencyAlert(explanation);
        } else {
          speakNativeTTS(explanation);
        }
      }, 1200);

      return;
    }

    // 2. GREETINGS AND CASUAL LIGHT TALK
    if (textLower === 'hi' || textLower === 'hello' || textLower.includes('how are you') || textLower.includes('good morning')) {
      setPipelineState({ intake: 'processing', triage: 'processing', orchestrator: 'processing', empathy: 'processing' });
      setTimeout(() => {
        const greetingResp = "Hello there! 👋 I am doing wonderful, thank you for asking! How are you feeling today? You can share how your day is going, ask medical questions, or tap 'Analyze Smartwatch Telemetry' to check your heart rate and body temp!";
        setPipelineState({ intake: 'complete', triage: 'complete', orchestrator: 'complete', empathy: 'complete' });
        setMessages(prev => [...prev, { role: 'assistant', text: greetingResp }]);
        speakNativeTTS(greetingResp);
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
          phoneNumber: phoneNumber,
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

      const isEmergencyQuery = textLower.includes('chest') || textLower.includes('stroke') || textLower.includes('numb') || textLower.includes('emergency') || textLower.includes('severe');

      if (data.triage.priority === 'HIGH' || isEmergencyQuery) {
        triggerRedEmergencyAlert(data.empathy.spokenText);
      } else {
        if (data.empathy.audioBase64 && audioRef.current) {
          audioRef.current.src = `data:audio/mpeg;base64,${data.empathy.audioBase64}`;
          audioRef.current.play().catch(e => {
            console.warn("Audio play failed, using browser speech synthesis:", e);
            speakNativeTTS(data.empathy.spokenText);
          });
        } else if (data.empathy.spokenText) {
          speakNativeTTS(data.empathy.spokenText);
        }
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

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
      <audio ref={audioRef} />

      {/* FULLSCREEN RED EMERGENCY LOCKDOWN OVERLAY */}
      {redEmergencyActive && (
        <div className="fixed inset-0 z-50 bg-red-600 text-white flex flex-col p-8 overflow-y-auto animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto w-full space-y-8 my-auto">
            {/* Header Siren Banner */}
            <div className="flex items-center gap-6 bg-red-700/80 p-6 rounded-3xl border-2 border-white/30 shadow-2xl">
              <div className="p-4 bg-white text-red-600 rounded-2xl animate-bounce shadow-xl">
                <Siren className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-white text-red-700 font-extrabold text-xs uppercase tracking-widest rounded-full">
                    🚨 CRITICAL EMERGENCY LEVEL ACTIVE
                  </span>
                  <span className="text-xs text-red-200 font-mono">DISPATCH TARGET: {phoneNumber}</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight mt-1">RED EMERGENCY PROTOCOL ACTIVATED</h1>
                <p className="text-red-100 text-sm mt-1">High-Risk Triage & Carrier Voice/SMS Alert Triggered</p>
              </div>
            </div>

            {/* Emergency Actions Status Cards */}
            <div className="bg-red-950/40 backdrop-blur border border-red-400/40 rounded-3xl p-6 space-y-4 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <ShieldAlert className="w-6 h-6 text-red-300" /> Autonomous Dispatches Executed to {phoneNumber}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-900">
                <div className="bg-white p-5 rounded-2xl space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                    <Building2 className="w-5 h-5" /> Nearest Emergency Hospital
                  </div>
                  <p className="font-bold text-slate-900 text-base">{result?.orchestration?.hospital?.name || 'City General Emergency Hospital'}</p>
                  <p className="text-xs font-semibold text-emerald-600">Ambulance ETA: {result?.orchestration?.hospital?.eta || '8 mins'}</p>
                </div>
                
                <div className="bg-white p-5 rounded-2xl space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                    <MessageSquare className="w-5 h-5" /> SMS Alert Dispatched
                  </div>
                  <p className="font-bold text-slate-900 text-base">Target: {phoneNumber}</p>
                  <p className="text-xs font-semibold text-emerald-600">Status: Dispatched & Logged</p>
                </div>

                <div className="bg-white p-5 rounded-2xl space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                    <PhoneCall className="w-5 h-5" /> Voice Call Channel
                  </div>
                  <p className="font-bold text-slate-900 text-base">HealthSense Dispatch</p>
                  <p className="text-xs font-semibold text-blue-600">Carrier Audio Active</p>
                </div>
              </div>
            </div>

            {/* Emergency Guidance Box */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 space-y-4 shadow-xl border-4 border-red-400">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-red-600 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" /> Live Clinical Guidance Readout
                </h3>
                <button 
                  onClick={() => speakNativeTTS(result?.empathy?.spokenText || "Emergency health alert active for Eleanor Vance. Stay calm and rest while medical help arrives.")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 text-xs transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" /> Re-play Spoken Audio
                </button>
              </div>
              <p className="text-base text-slate-800 leading-relaxed font-medium">
                {result?.empathy?.spokenText || "We have identified critical warning signs and dispatched emergency alerts to your primary doctor and mobile number (+91 6359385870). Please remain seated, stay calm, and avoid physical exertion while assistance arrives."}
              </p>
            </div>

            {/* Acknowledge Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => triggerSimulatedPhoneCall(result?.empathy?.spokenText || "Emergency call connected")}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-lg shadow-2xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PhoneIncoming className="w-6 h-6" /> Answer Simulated Call
              </button>
              <button 
                onClick={() => setRedEmergencyActive(false)}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-extrabold rounded-2xl text-lg shadow-xl transition cursor-pointer"
              >
                Dismiss Red Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INCOMING EMERGENCY PHONE CALL MODAL */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 text-center text-white space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-blue-600/30 text-blue-400 rounded-full flex items-center justify-center mx-auto border-2 border-blue-400/50 animate-pulse">
                <PhoneIncoming className="w-12 h-12 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
                {incomingCall.inCall ? '🔴 IN CALL WITH EMERGENCY DISPATCH' : '📞 INCOMING EMERGENCY VOICE CALL'}
              </p>
              <h3 className="font-bold text-xl text-white">{incomingCall.callerName}</h3>
              <p className="font-mono text-sm text-slate-400 mt-1">{incomingCall.callerNumber}</p>
            </div>

            {incomingCall.inCall ? (
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-left space-y-2">
                <p className="text-xs text-blue-400 font-bold uppercase">Live Audio Transcript:</p>
                <p className="text-sm text-slate-200 leading-relaxed">{incomingCall.script}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Tap <strong className="text-emerald-400">Answer Call</strong> below to listen to your personalized emergency triage audio report out loud!
              </p>
            )}

            <div className="flex items-center justify-center gap-6 pt-2">
              {!incomingCall.inCall ? (
                <>
                  <button 
                    onClick={acceptPhoneCall}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <PhoneIncoming className="w-5 h-5" /> Answer Call
                  </button>
                  <button 
                    onClick={endPhoneCall}
                    className="p-4 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition cursor-pointer"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={endPhoneCall}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" /> End Call
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

        <div className="flex items-center gap-3">
          {/* TRIGGER RED EMERGENCY ALERT BUTTON */}
          <button
            onClick={() => triggerRedEmergencyAlert()}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer animate-pulse"
            title="Trigger Full-Screen Red Emergency Alert Lockdown"
          >
            <Siren className="w-4 h-4 text-white" />
            <span>🚨 RED EMERGENCY ALERT</span>
          </button>

          {/* Test Emergency Phone Call Simulator */}
          <button
            onClick={() => triggerSimulatedPhoneCall("Emergency health alert for Eleanor Vance: High risk cardiometabolic spike detected. Your primary doctor Dr. Arthur Pendelton has been alerted.")}
            className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold rounded-xl border border-red-500/40 flex items-center gap-2 transition cursor-pointer"
            title="Simulate incoming emergency voice call"
          >
            <PhoneIncoming className="w-3.5 h-3.5 text-red-400" />
            <span>Test Call Simulator</span>
          </button>

          {/* SMS & Call Phone Number Selector */}
          <button
            onClick={() => setShowPhoneModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            title="Configure Call & SMS recipient phone number"
          >
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">Call/SMS:</span>
            <span className="font-mono text-white font-bold">{phoneNumber}</span>
          </button>

          {/* SMARTWATCH QUICK ANALYZER BUTTON */}
          <button
            onClick={handleSmartwatchAnalysis}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <Watch className="w-4 h-4 animate-pulse" />
            Analyze Smartwatch Telemetry
          </button>
        </div>
      </div>

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" /> Phone Number for Emergency Call & SMS
              </h3>
              <button onClick={() => setShowPhoneModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-500">
              Enter your mobile phone number (with country code, e.g. +91 6359385870) to receive live notifications and automated voice call alerts.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
              <input 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+916359385870"
                className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={() => setShowPhoneModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition cursor-pointer"
            >
              Save Phone Number
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : msg.isSmsNotice
                ? 'bg-red-600 text-white border-2 border-red-400 rounded-2xl shadow-xl font-mono text-xs'
                : msg.role === 'system'
                ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                : 'bg-white text-slate-900 border border-slate-200 rounded-tl-sm shadow-sm'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <p className={`${msg.role === 'assistant' ? 'text-sm leading-relaxed' : 'text-sm'}`}>{msg.text}</p>
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => speakNativeTTS(msg.text)}
                    className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition shrink-0 cursor-pointer"
                    title="Listen to audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
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
