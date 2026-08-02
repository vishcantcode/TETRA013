import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Heart,
  Apple,
  Footprints,
  Pill,
  FileText,
  UserCheck,
  ShieldCheck,
  Smile,
  Sun,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  ThumbsUp,
  Award,
  Stethoscope,
} from 'lucide-react';
import { Patient } from '../../types';

interface PatientCompanionResponseData {
  simpleExplanation: string;
  keyTakeaways: string[];
  practicalTip?: string;
  encouragement?: string;
  followUpQuestions?: string[];
}

interface PatientCompanionMessage {
  id: string;
  sender: 'user' | 'ai';
  timestamp: string;
  text?: string;
  data?: PatientCompanionResponseData;
}

interface Props {
  activePatient: Patient;
}

export const PatientAiCompanion: React.FC<Props> = ({ activePatient }) => {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Per-patient conversation history
  const [histories, setHistories] = useState<Record<string, PatientCompanionMessage[]>>({});

  useEffect(() => {
    if (!histories[activePatient.id]) {
      const initialMessage: PatientCompanionMessage = {
        id: `init-${activePatient.id}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: {
          simpleExplanation: `Hello ${activePatient.name}! 👋 I am your HealthSense AI Health Caretaker & Friend. I am here to chat with you about ANYTHING—how you're feeling today, your food, exercise, medicines, or just to have a friendly conversation!`,
          keyTakeaways: [
            `Your recent HbA1c is ${activePatient.vitals.hba1c}% and BP is ${activePatient.vitals.bpSystolic}/${activePatient.vitals.bpDiastolic} mmHg.`,
            `Your primary doctor, ${activePatient.primaryDoctor}, is guiding your health plan.`,
            `Feel free to talk to me about anything on your mind!`,
          ],
          practicalTip: 'Tip of the Day: Taking 5 minutes to sit comfortably, breathe deeply, and smile sets a wonderful tone for your day! 🌿',
          encouragement: 'I am always right here by your side. How are you feeling today? 😊',
          followUpQuestions: [
            'How are you feeling today?',
            'Can I eat mango?',
            'Can I eat rice?',
            'Give me a friendly motivation boost',
            'Explain my medicines',
          ],
        },
      };

      setHistories((prev) => ({
        ...prev,
        [activePatient.id]: [initialMessage],
      }));
    }
  }, [activePatient.id]);

  const currentMessages = histories[activePatient.id] || [];

  const exampleQuestions = [
    { label: '💬 How are you feeling today?', query: 'I want to talk about how I am feeling today.' },
    { label: '🥭 Can I eat mango?', query: 'Can I eat mango?' },
    { label: '🍚 Can I eat rice?', query: 'Can I eat rice?' },
    { label: '🚶 Can I walk every day?', query: 'Can I walk every day?' },
    { label: '✨ Daily Motivation Boost', query: 'Give me a friendly motivational message for my health today!' },
    { label: '💊 Explain my medicines', query: 'Can you explain my medicines in simple words?' },
    { label: '🩸 Why do I need HbA1c?', query: 'Why do I need HbA1c?' },
    { label: '👨‍⚕️ Why was I referred?', query: 'Why was I referred?' },
  ];

  // High-fidelity local fallback engine in Simple English (Zero Medical Jargon)
  const generateLocalPatientResponse = (q: string, p: Patient): PatientCompanionResponseData => {
    const qLower = q.toLowerCase();

    // 1. Mango Diet Query
    if (qLower.includes('mango')) {
      return {
        simpleExplanation: `Yes, you can enjoy mangoes! 🥭 However, because mangoes contain natural sugars, it is best to eat them in small, controlled portions rather than eating a whole large mango at once.`,
        keyTakeaways: [
          'Enjoy 2 to 3 small slices (about 50 grams or half a small cup) instead of eating a whole mango.',
          'Eat mango slices right after a balanced meal or paired with a few almonds/nuts to prevent sudden blood sugar spikes.',
          'Avoid drinking mango juice or mango milkshakes because liquid sugars enter your blood much faster.',
        ],
        practicalTip: 'Slice a small piece of fresh mango into a cup of plain yogurt or enjoy it fresh in the morning!',
        encouragement: 'You do not have to give up your favorite fruits! Healthy eating is all about balance and small portions. 🌟',
        followUpQuestions: ['Can I eat rice?', 'What other fruits are safe for blood sugar?', 'Can I walk every day?'],
      };
    }

    // 2. Rice Diet Query
    if (qLower.includes('rice')) {
      return {
        simpleExplanation: `Yes, you can eat rice! 🍚 The secret is portion size and how you build your plate. White rice breaks down into sugar quickly, so pairing it with vegetables and protein keeps your blood sugar steady.`,
        keyTakeaways: [
          'Fill half of your plate with fresh vegetables or salad, one-quarter with protein (like lentils, dal, paneer, or fish), and one-quarter with rice.',
          'Try switching to brown rice, red rice, or mixing white rice with quinoa/millet for extra healthy fiber.',
          'Eating cooked dal or leafy greens alongside rice helps slow down sugar absorption.',
        ],
        practicalTip: 'Measure 1 small bowl (katori) of rice per meal and enjoy it with plenty of vegetable curry!',
        encouragement: 'Small adjustments to your meal layout allow you to enjoy your traditional home foods comfortably! 🍽️',
        followUpQuestions: ['Can I eat roti instead of rice?', 'Can I eat mango?', 'How much water should I drink?'],
      };
    }

    // 3. Daily Walking Exercise Query
    if (qLower.includes('walk') || qLower.includes('exercise')) {
      return {
        simpleExplanation: `Yes! Walking every day is one of the best and safest things you can do for your heart, blood sugar, and overall mood! 🚶‍♂️✨`,
        keyTakeaways: [
          'Aim for 20 to 30 minutes of brisk walking every day.',
          'Taking a short 10-minute walk right after lunch and dinner helps your muscles use up blood sugar naturally.',
          'Wear comfortable shoes, carry a bottle of water, and listen to your body—stop if you feel dizzy or chest discomfort.',
        ],
        practicalTip: 'Start with 15 minutes today, and add 5 minutes every week until you reach 30 minutes comfortable daily walk!',
        encouragement: 'Walking is free, simple, and super powerful for your heart and mind! Keep up the fantastic work! 🏃‍♀️',
        followUpQuestions: ['What should I do if I feel tired?', 'Why do I need HbA1c test?', 'Explain my medicines'],
      };
    }

    // 4. Why HbA1c Test
    if (qLower.includes('hba1c') || qLower.includes('blood sugar average')) {
      return {
        simpleExplanation: `An HbA1c test is a simple blood test that shows your average blood sugar levels over the past 3 months (90 days). 🩸`,
        keyTakeaways: [
          'Regular finger-prick tests only show your sugar right at that second, but HbA1c gives the big picture of your sugar health.',
          `Your current HbA1c level is ${p.vitals.hba1c}%. Doctors aim for a target below 7.0% for healthy sugar control.`,
          'Getting this test every 3 to 6 months helps your doctor check if your medicines and diet are working well.',
        ],
        practicalTip: 'Keep a small notebook or phone log of your lab test dates so you never miss your quarterly check-up!',
        encouragement: 'Knowing your numbers gives you the power to protect your health before any problems start! 📊',
        followUpQuestions: ['Why was I referred to a specialist?', 'Explain my medicines', 'Can I eat mango?'],
      };
    }

    // 5. Why Referred Query
    if (qLower.includes('refer') || qLower.includes('specialist') || qLower.includes('doctor')) {
      return {
        simpleExplanation: `Your doctor referred you to a specialist (${p.referralSpecialist || 'a clinical specialist'}) to give you extra expert care and keep your organs healthy! 👨‍⚕️🤝`,
        keyTakeaways: [
          'A referral is not a reason to worry—it simply means your doctor wants a specialist to double-check your heart, sugar, or kidney health.',
          'Specialists have advanced tools to guide your medicine doses and prevent long-term health complications.',
          `Your referral status is active with ${p.referralSpecialist || 'Endocrinology / Cardiology'}, ensuring seamless teamwork between your care team.`,
        ],
        practicalTip: 'Write down 2 or 3 questions on paper before visiting your specialist so you do not forget anything!',
        encouragement: 'Having a team of doctors working together means you get the highest quality care possible! 💙',
        followUpQuestions: ['What recommendations should I follow?', 'Why do I need HbA1c?', 'Can I walk every day?'],
      };
    }

    // 6. Explain Medicines
    if (qLower.includes('medicine') || qLower.includes('drug') || qLower.includes('pill')) {
      return {
        simpleExplanation: `Your medicines are designed to keep your blood sugar steady and protect your blood vessels and heart. 💊`,
        keyTakeaways: [
          'Metformin helps your body respond better to natural insulin and keeps your blood sugar balanced after meals.',
          'Lisinopril relaxes your blood vessels to keep your blood pressure gentle and protect your kidneys.',
          'Atorvastatin keeps your arteries clean by managing cholesterol levels.',
        ],
        practicalTip: 'Set a daily reminder alarm on your phone or use a weekly pill box so you take your pills at the same time every day!',
        encouragement: 'Taking your medicines regularly as advised by Dr. Arthur Pendelton protects your future health every single day! 🌈',
        followUpQuestions: ['Can I eat mango?', 'Can I walk every day?', 'Give me a friendly motivational message'],
      };
    }

    // 7. Daily Motivation
    if (qLower.includes('motivation') || qLower.includes('daily') || qLower.includes('booster')) {
      return {
        simpleExplanation: `Good morning ${p.name}! Today is a fresh new day filled with opportunities to nourish your body and mind. ☀️🌿`,
        keyTakeaways: [
          'Drink a warm glass of water first thing today.',
          'Take a peaceful 20-minute walk outdoors in fresh morning light.',
          'Eat a rainbow of colorful vegetables with lunch!',
        ],
        practicalTip: 'Smile in the mirror and remind yourself: "I am taking small, healthy steps every day for my future!"',
        encouragement: 'You are doing an incredible job taking charge of your health. Your body thanks you for every positive choice you make! 🌻',
        followUpQuestions: ['Can I eat mango?', 'Can I walk every day?', 'Why do I need HbA1c?'],
      };
    }

    // 8. General Conversational / Friendly Answer
    return {
      simpleExplanation: `I'm so glad you shared that with me, ${p.name}! As your personal health caretaker and friend, I'm always here to chat about anything on your mind—whether it's how you're feeling, your daily routine, food, exercise, or just catching up. 😊`,
      keyTakeaways: [
        `You're doing wonderful taking time for yourself today.`,
        `Dr. ${p.primaryDoctor} and your care team are always here supporting your health journey.`,
        'Every day is a fresh opportunity to feel great and stay positive.',
      ],
      practicalTip: 'Take a moment to step outside for 5 minutes, breathe in fresh air, and drink a glass of water!',
      encouragement: 'I am always right here whenever you want to chat. You are doing great, my friend! 🌟',
      followUpQuestions: ['How are you feeling today?', 'Can I eat mango?', 'Can I walk every day?', 'Give me a friendly motivation boost'],
    };
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || query;
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: PatientCompanionMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    setHistories((prev) => ({
      ...prev,
      [activePatient.id]: [...(prev[activePatient.id] || []), userMsg],
    }));

    if (!customPrompt) setQuery('');
    setIsGenerating(true);

    try {
      // Backend request
      const res = await fetch('/api/patient-companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: activePatient,
          query: textToSend,
        }),
      });

      const responseData = await res.json();

      let aiData: PatientCompanionResponseData;
      if (responseData && responseData.isAiGenerated && responseData.simpleExplanation) {
        aiData = responseData;
      } else {
        aiData = generateLocalPatientResponse(textToSend, activePatient);
      }

      const aiMsg: PatientCompanionMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: aiData,
      };

      setHistories((prev) => ({
        ...prev,
        [activePatient.id]: [...(prev[activePatient.id] || []), aiMsg],
      }));
    } catch (err) {
      console.error('Patient Companion Error:', err);
      const aiData = generateLocalPatientResponse(textToSend, activePatient);
      const aiMsg: PatientCompanionMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: aiData,
      };

      setHistories((prev) => ({
        ...prev,
        [activePatient.id]: [...(prev[activePatient.id] || []), aiMsg],
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* WELCOME BANNER FOR PATIENT */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-lg border border-white/30">
              Your Personal Health AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {activePatient.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed font-medium">
            I am your friendly AI Health Companion. Ask me anything about your food, daily exercise, lab reports, or doctor recommendations in simple English!
          </p>
        </div>

        {/* Daily Motivation Trigger Card */}
        <button
          onClick={() => handleSend('Give me a friendly motivational message for my health today!')}
          disabled={isGenerating}
          className="z-10 px-5 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-left text-white transition shadow-lg shrink-0 flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 block">
              Daily Motivation
            </span>
            <span className="text-xs sm:text-sm font-extrabold block">
              Get Today's Health Booster ✨
            </span>
          </div>
        </button>
      </div>

      {/* QUICK SUGGESTION CHIPS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Tap to Ask Me Common Health Questions:</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {exampleQuestions.map((item, idx) => (
            <button
              key={idx}
              disabled={isGenerating}
              onClick={() => handleSend(item.query)}
              className="px-3.5 py-2 bg-teal-50/80 hover:bg-teal-100 dark:bg-slate-800 dark:hover:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/60 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONVERSATION HISTORY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm min-h-[420px] flex flex-col justify-between space-y-6">
        <div className="space-y-6 overflow-y-auto max-h-[600px] pr-1">
          {currentMessages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.sender === 'user' ? (
                /* USER QUESTION BUBBLE */
                <div className="flex justify-end">
                  <div className="max-w-lg bg-teal-600 text-white p-4 rounded-2xl rounded-tr-none text-xs sm:text-sm font-bold shadow-md space-y-1">
                    <p>{msg.text}</p>
                    <span className="text-[10px] text-teal-200 block text-right font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              ) : (
                /* AI COMPANION RESPONSE CARD */
                <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-md">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                          HealthSense AI Companion
                        </span>
                        <p className="text-[10px] text-slate-400">Simple English Explanation</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 text-[10px] font-black rounded-full border border-teal-200 dark:border-teal-800">
                      Easy to Understand
                    </span>
                  </div>

                  {/* Simple Explanation */}
                  {msg.data?.simpleExplanation && (
                    <div className="p-4 bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed shadow-2xs">
                      {msg.data.simpleExplanation}
                    </div>
                  )}

                  {/* Key Takeaways / Simple Bullets */}
                  {msg.data?.keyTakeaways && msg.data.keyTakeaways.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-500" /> Key Things to Know
                      </h4>
                      <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                        {msg.data.keyTakeaways.map((item, kIdx) => (
                          <div key={kIdx} className="flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2" />
                            <p className="leading-relaxed font-semibold">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practical Daily Tip Box */}
                  {msg.data?.practicalTip && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold uppercase text-[10px] text-amber-700 dark:text-amber-300 block">
                          Practical Health Tip
                        </span>
                        <p className="leading-relaxed mt-0.5">{msg.data.practicalTip}</p>
                      </div>
                    </div>
                  )}

                  {/* Encouragement Sentence */}
                  {msg.data?.encouragement && (
                    <div className="p-3.5 bg-teal-500 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-md">
                      <Heart className="w-4 h-4 text-rose-200 fill-rose-200 shrink-0" />
                      <span>{msg.data.encouragement}</span>
                    </div>
                  )}

                  {/* Follow-Up Suggested Chips */}
                  {msg.data?.followUpQuestions && msg.data.followUpQuestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        You can also ask me:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.data.followUpQuestions.map((fq, fIdx) => (
                          <button
                            key={fIdx}
                            disabled={isGenerating}
                            onClick={() => handleSend(fq)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>{fq}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 rounded-2xl flex items-center gap-3 text-xs text-teal-800 dark:text-teal-200 font-bold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Thinking of a simple, friendly explanation for you...</span>
            </div>
          )}
        </div>

        {/* FRIENDLY DISCLAIMER FOOTER */}
        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Friendly Reminder:</strong> I am your AI health companion here to answer health questions in simple terms. I do not give medical diagnoses or change medicines. Always check with <strong>Dr. {activePatient.primaryDoctor}</strong> or your care team for any medical decisions!
          </span>
        </div>

        {/* INPUT BAR */}
        <div className="pt-1 flex gap-2">
          <input
            type="text"
            placeholder={`Ask a question (e.g. "Can I eat mango?", "Can I walk every day?")...`}
            value={query}
            disabled={isGenerating}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={isGenerating || !query.trim()}
            className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
