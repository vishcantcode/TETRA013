import React, { useState } from 'react';
import { BookOpen, Sparkles, Heart, Activity, ShieldAlert, Zap, ArrowRight, CheckCircle2, X, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Article {
  id: string;
  topic: string;
  title: string;
  category: 'Diabetes' | 'Hypertension' | 'Kidney Health' | 'Heart Health' | 'Stroke Prevention' | 'Lifestyle';
  iconColor: string;
  summary: string;
  readTime: string;
  takeaways: string[];
  fullContent: string;
  doctorTip: string;
}

const GLOSSARY_TERMS: Record<string, Record<string, { term: string; simpleMeaning: string; example: string }>> = {
  en: {
    hba1c: { term: 'HbA1c', simpleMeaning: '3-Month Blood Sugar Average', example: 'Reflects your overall sugar control over 90 days. Target is usually below 6.5%.' },
    bp: { term: 'Blood Pressure (BP)', simpleMeaning: 'Pressure inside blood vessels', example: 'Top number (Systolic) is when heart beats; bottom (Diastolic) is when heart rests.' },
    egfr: { term: 'eGFR / Creatinine', simpleMeaning: 'Kidney Cleaning Score', example: 'Shows how fast your kidneys filter waste products from your blood.' },
    bmi: { term: 'Body Mass Index (BMI)', simpleMeaning: 'Weight-to-Height Ratio', example: 'A measure to check if your body weight is healthy for your height.' },
    ldl: { term: 'LDL Cholesterol', simpleMeaning: 'Bad Cholesterol', example: 'Plaque that can build up in arteries. Keeping it low protects your heart.' },
  },
  hi: {
    hba1c: { term: 'HbA1c (एचबीए1सी)', simpleMeaning: '3 महीने का ब्लड शुगर औसत', example: 'यह पिछले 90 दिनों में आपके शुगर नियंत्रण का स्तर बताता है। 6.5% से कम अच्छा माना जाता है।' },
    bp: { term: 'रक्तचाप (ब्लड प्रेशर)', simpleMeaning: 'नसों में खून का दबाव', example: 'ऊपर का नंबर हृदय धड़कने पर दबाव है; नीचे का नंबर हृदय विश्राम करने का दबाव है।' },
    egfr: { term: 'eGFR / क्रिएटिनिन', simpleMeaning: 'गुर्दे (किडनी) की सफाई क्षमता', example: 'यह बताता है कि आपकी किडनी खून से कचरा कितनी तेजी से साफ कर रही है।' },
    bmi: { term: 'बॉडी मास इंडेक्स (BMI)', simpleMeaning: 'ऊंचाई के हिसाब से वजन', example: 'यह जांचने का पैमाना है कि आपकी लंबाई के हिसाब से वजन सही है या नहीं।' },
    ldl: { term: 'एलडीएल (LDL)', simpleMeaning: 'हानिकारक (खराब) कोलेस्ट्रॉल', example: 'नसों में जमने वाली चर्बी। इसे कम रखने से दिल सुरक्षित रहता है।' },
  },
  gu: {
    hba1c: { term: 'HbA1c (એચબીએ1સી)', simpleMeaning: '3 મહિનાનું બ્લડ સુગર સરેરાશ', example: 'છેલ્લા 90 દિવસમાં તમારા સુગર નિયંત્રણનું સ્તર દર્શાવે છે. 6.5% થી ઓછું સારું ગણાય.' },
    bp: { term: 'બ્લડ પ્રેશર (રક્તચાપ)', simpleMeaning: 'નસોમાં લોહીનું દબાણ', example: 'ઉપરનો આંકડો હૃદય ધબકે ત્યારનું દબાણ છે; નીચેનો આંકડો વિરામ સમયનું દબાણ છે.' },
    egfr: { term: 'eGFR / ક્રિએટિનિન', simpleMeaning: 'કિડનીની સફાઈ ક્ષમતા', example: 'તમારી કિડની લોહીમાંથી કચરો કેટલી ઝડપથી સાફ કરે છે તે દર્શાવે છે.' },
    bmi: { term: 'બોડી માસ ઇન્ડેક્સ (BMI)', simpleMeaning: 'ઊંચાઈ મુજબ વજનનું પ્રમાણ', example: 'તમારી ઊંચાઈ પ્રમાણે વજન યોગ્ય છે કે નહીં તે ચકાસવાનો માપદંડ.' },
    ldl: { term: 'એલડીએલ (LDL)', simpleMeaning: 'ખરાબ કોલેસ્ટ્રોલ', example: 'નસોમાં જામતી ચરબી. આ ઓછું રાખવાથી હૃદય સુરક્ષિત રહે છે.' },
  },
  mr: {
    hba1c: { term: 'HbA1c (एचबीए1सी)', simpleMeaning: '3 महिन्यांची रक्तातील साखरेची सरासरी', example: 'गेल्या 90 दिवसांतील साखर नियंत्रणाची पातळी दर्शवते. 6.5% पेक्षा कमी असणे चांगले.' },
    bp: { term: 'रक्तदाब (ब्लड प्रेशर)', simpleMeaning: 'रक्तवाहिन्यांमधील रक्ताचा दाब', example: 'वरचा आकडा हृदय धडकतानाचा दाब आहे; खालचा आकडा विश्रांतीचा दाब आहे.' },
    egfr: { term: 'eGFR / क्रिएटिनिन', simpleMeaning: 'मूत्रपिंडाची (किडनीची) स्वच्छता क्षमता', example: 'तुमची किडनी रक्तातील कचरा किती वेगाने साफ करते हे दर्शवते.' },
    bmi: { term: 'बॉडी मास इंडेक्स (BMI)', simpleMeaning: 'उंचीनुसार वजनाचे प्रमाण', example: 'उंचीनुसार तुमचे वजन योग्य आहे की नाही हे तपासण्याचे प्रमाण.' },
    ldl: { term: 'एलडीएल (LDL)', simpleMeaning: 'वाईट (हानिकारक) कोलेस्ट्रॉल', example: 'रक्तवाहिन्यांमध्ये जमणारी चरबी. हे कमी ठेवल्याने हृदय सुरक्षित राहते.' },
  },
};

const EDUCATIONAL_ARTICLES: Article[] = [
  {
    id: 'edu-1',
    topic: 'Understanding Diabetes & Blood Sugar',
    title: 'How HbA1c Reflects Your 3-Month Glucose Balance',
    category: 'Diabetes',
    iconColor: 'bg-amber-500',
    summary: 'Learn how hemoglobin A1c measures the percentage of red blood cells coated with sugar over the past 90 days.',
    readTime: '3 min read',
    takeaways: [
      'HbA1c measures average blood glucose over the lifespan of red blood cells (80-120 days).',
      'A level below 5.7% is normal; 5.7% to 6.4% indicates prediabetes; 6.5% or higher indicates diabetes.',
      'Small daily dietary adjustments and regular walks significantly reduce HbA1c over 12 weeks.'
    ],
    fullContent: `Hemoglobin A1c is one of the most reliable markers used in clinical medicine to evaluate long-term glycemic control. When sugar enters your bloodstream, it naturally attaches to hemoglobin—the oxygen-carrying protein inside red blood cells. Since red blood cells live for about 3 months, an HbA1c test provides a clear "moving average" of your blood sugar control over that entire timeframe.\n\nUnlike daily fingerstick readings that fluctuate with meal timing, HbA1c is not affected by what you ate earlier in the day. Keeping your HbA1c within target ranges established by your physician helps protect your blood vessels, kidneys, eyes, and nerve fibers from chronic glucose toxicity.`,
    doctorTip: 'Always consult your primary physician before making significant changes to medication or diet routines.'
  },
  {
    id: 'edu-2',
    topic: 'Managing Blood Pressure',
    title: 'The Silent Impact of Systolic vs. Diastolic Numbers',
    category: 'Hypertension',
    iconColor: 'bg-blue-500',
    summary: 'Discover what 120/80 mmHg actually means for your arterial elasticity and heart workload.',
    readTime: '4 min read',
    takeaways: [
      'Systolic (top number) represents pressure when the heart beats; Diastolic (bottom number) when the heart rests.',
      'Optimal resting blood pressure is under 120/80 mmHg.',
      'Reducing dietary sodium to under 2,000 mg/day can lower systolic pressure by 5-8 points.'
    ],
    fullContent: `Blood pressure measures the force exerted by circulating blood against the walls of your body's major arteries. The top number (systolic) measures arterial pressure during cardiac contraction, while the bottom number (diastolic) measures pressure between beats when the heart refills with blood.\n\nChronically elevated arterial pressure causes micro-tears in arterial walls, accelerating plaque buildup and placing strain on cardiac muscle. Monitoring your blood pressure twice weekly at home provides your doctor with valuable trends to optimize treatment.`,
    doctorTip: 'Sit quietly for 5 minutes before taking a reading, and avoid caffeine 30 minutes prior.'
  },
  {
    id: 'edu-3',
    topic: 'Kidney Health & Filtration',
    title: 'eGFR and Creatinine: Safeguarding Renal Function',
    category: 'Kidney Health',
    iconColor: 'bg-emerald-500',
    summary: 'Understand how your kidneys filter waste and why eGFR is your primary renal filtration biomarker.',
    readTime: '3 min read',
    takeaways: [
      'Creatinine is a natural muscle breakdown product filtered almost entirely by healthy kidneys.',
      'eGFR (estimated Glomerular Filtration Rate) calculates how efficiently your kidneys clean blood per minute.',
      'Adequate hydration and avoiding unnecessary NSAID pain relievers protect renal micro-vessels.'
    ],
    fullContent: `Your kidneys contain over one million microscopic filtering units called nephrons, which continuously filter blood to remove metabolic waste while conserving vital proteins and minerals. Creatinine is a natural waste product generated by normal muscle activity. When kidney function is optimal, creatinine is efficiently cleared into urine.\n\nAn elevated serum creatinine or a declining eGFR signals that nephrons may be under pressure from high blood pressure, elevated blood sugar, or dehydration. Early detection through regular pathology testing allows proactive lifestyle interventions to preserve kidney function.`,
    doctorTip: 'Stay well hydrated with water unless advised otherwise by your doctor for fluid balance constraints.'
  },
  {
    id: 'edu-4',
    topic: 'Heart Health & Lipid Panels',
    title: 'HDL, LDL, and Triglycerides Demystified',
    category: 'Heart Health',
    iconColor: 'bg-red-500',
    summary: 'Demystifying cholesterol types and how healthy lipids protect coronary arteries.',
    readTime: '4 min read',
    takeaways: [
      'LDL ("bad cholesterol") delivers cholesterol to tissues; excessive LDL deposits in arterial walls.',
      'HDL ("good cholesterol") scavenges excess cholesterol and returns it to the liver for clearance.',
      'Aerobic activity and soluble dietary fibers increase HDL while reducing circulating triglycerides.'
    ],
    fullContent: `Cholesterol is a vital lipid required to build cell membranes and synthesize hormones. Because cholesterol cannot dissolve in blood, it is transported through your vascular system inside lipo-protein packages. Low-Density Lipoprotein (LDL) transports cholesterol to tissues, but when present in excess, it oxidizes and contributes to coronary plaque buildup.\n\nHigh-Density Lipoprotein (HDL) acts as a vascular vacuum cleaner, picking up unneeded cholesterol from vessel walls and transporting it back to the liver. Maintaining balanced lipids reduces cardiovascular event risk significantly.`,
    doctorTip: 'Incorporate omega-3 fatty acids from fish, walnuts, or flaxseeds into your weekly diet.'
  },
  {
    id: 'edu-5',
    topic: 'Stroke Prevention & Vascular Health',
    title: 'Recognizing Early Signals & Vascular Resilience',
    category: 'Stroke Prevention',
    iconColor: 'bg-purple-500',
    summary: 'Essential knowledge on carotid blood flow, blood pressure control, and stroke risk reduction.',
    readTime: '3 min read',
    takeaways: [
      'Controlling blood pressure is the single most effective way to reduce stroke risk.',
      'Atrial fibrillation (irregular heartbeat) and vascular stiffness increase ischemic stroke risk.',
      'Know the FAST warning signs: Face drooping, Arm weakness, Speech difficulty, Time to call emergency.'
    ],
    fullContent: `A stroke occurs when blood flow to a portion of the brain is interrupted, depriving brain tissue of oxygen and vital nutrients. Ischemic strokes, which account for roughly 87% of all cases, occur when a blood clot obstructs a cerebral vessel. Hemorrhagic strokes occur when a weakened blood vessel ruptures.\n\nMaintaining arterial flexibility through regular exercise, optimal blood pressure management, and glycemic stability dramatically reduces vascular strain and stroke susceptibility.`,
    doctorTip: 'If you ever experience sudden facial weakness, arm numbness, or speech difficulty, seek immediate emergency care.'
  },
  {
    id: 'edu-6',
    topic: 'Managing Lifestyle Diseases',
    title: 'Metabolic Health: Small Daily Habits, Major Results',
    category: 'Lifestyle',
    iconColor: 'bg-teal-500',
    summary: 'How nutrition, restorative sleep, and physical movement reverse chronic metabolic fatigue.',
    readTime: '4 min read',
    takeaways: [
      'Metabolic syndrome involves a cluster of conditions: elevated BP, high glucose, excess abdominal fat, and abnormal cholesterol.',
      '150 minutes of moderate physical activity per week reduces metabolic disease risk by up to 30%.',
      'Consistent 7-8 hours of sleep regulates cortisol and improves insulin sensitivity.'
    ],
    fullContent: `Lifestyle diseases develop gradually as a result of chronic metabolic imbalances. Factors like elevated stress, sedentary routines, refined sugar consumption, and irregular sleep elevate stress hormones like cortisol, triggering systemic low-grade inflammation and insulin resistance.\n\nThe human body possesses remarkable resilience. Reversing metabolic strain does not require extreme changes; consistent, moderate daily habits—such as 30-minute daily walks, balanced hydration, and whole-food nutrition—yield profound health improvements.`,
    doctorTip: 'Focus on building sustainable habits rather than short-term drastic diets.'
  }
];

export const PatientEducation: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const currentGlossary = GLOSSARY_TERMS[language] || GLOSSARY_TERMS['en'];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30">
              {t('patientEducationTitle', 'Patient Education Hub')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('patientEducationTitle', 'Patient Education & Health Knowledge')}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
            Empowering you with clear, medically verified guides explaining lab markers, clinical terminology, lifestyle adjustments, and emergency warning signs in plain everyday words.
          </p>
        </div>
      </div>

      {/* EASY MEDICAL GLOSSARY SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t('simpleMedicalTerm', 'Medical Terminology in Simple Words')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(currentGlossary).map(([key, item]) => (
            <div key={key} className="p-4 bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-2xl space-y-1.5">
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 block uppercase tracking-wider">
                {item.term}
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                💡 {item.simpleMeaning}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.example}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {EDUCATIONAL_ARTICLES.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  {art.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {art.readTime}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${art.iconColor}`} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {art.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {art.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Read Key Takeaways</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                {selectedArticle.category} • {selectedArticle.readTime}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-3">
                {selectedArticle.title}
              </h2>
            </div>

            {/* Quick Takeaways Box */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl space-y-2">
              <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Key Takeaways
              </span>
              <ul className="space-y-1.5 pl-2">
                {selectedArticle.takeaways.map((t, idx) => (
                  <li key={idx} className="text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Article Content */}
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
              {selectedArticle.fullContent}
            </div>

            {/* Doctor Note Disclaimer */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Advice Reminder</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                💡 {selectedArticle.doctorTip}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Close Education Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
