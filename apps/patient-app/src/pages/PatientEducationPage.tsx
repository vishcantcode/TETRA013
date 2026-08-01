import React from 'react';
import { BookOpen, Volume2, Printer, AlertOctagon, Heart, Salad, Activity } from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';

export default function PatientEducationPage() {
  const { educationPlan, educationLanguage, setEducationLanguage } = useCDSS();

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(educationPlan.audioGuidance.scriptText);
      utterance.lang = educationLanguage === 'hi' ? 'hi-IN' : educationLanguage === 'gu' ? 'gu-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Playing Audio Guidance Script (${educationLanguage}): ${educationPlan.audioGuidance.scriptText}`);
    }
  };

  const printSheet = () => {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(educationPlan.printableSheetHtml);
      printWin.document.close();
      printWin.print();
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <TopNavigation />

      <div className="flex-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> Multilingual Patient Engagement & Health Coach
          </h2>
          <p className="text-xs text-secondary">
            Simplified Grade 6-8 reading level health guidance, Indian dietary recommendations, and red-flag warning cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" onClick={playAudio}>
            <Volume2 className="w-4 h-4 text-accent" /> Listen Audio
          </button>
          <button className="btn btn-primary btn-sm" onClick={printSheet}>
            <Printer className="w-4 h-4" /> Print PDF Sheet
          </button>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center gap-2 bg-tertiary p-2 rounded-lg border border-border">
        <span className="text-xs text-secondary font-medium">Select Vernacular Language:</span>
        <button onClick={() => setEducationLanguage('en')} className={`btn btn-sm ${educationLanguage === 'en' ? 'btn-primary' : 'btn-ghost'}`}>
          English
        </button>
        <button onClick={() => setEducationLanguage('hi')} className={`btn btn-sm ${educationLanguage === 'hi' ? 'btn-primary' : 'btn-ghost'}`}>
          हिंदी (Hindi)
        </button>
        <button onClick={() => setEducationLanguage('gu')} className={`btn btn-sm ${educationLanguage === 'gu' ? 'btn-primary' : 'btn-ghost'}`}>
          ગુજરાતી (Gujarati)
        </button>
      </div>

      {/* Main Health Card */}
      <div className="card p-6 space-y-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
        <div className="flex-between">
          <span className="badge badge-accent uppercase">Reading Level: {educationPlan.summary.readingGradeLevel}</span>
          <span className="text-2xs text-secondary">Language: {educationLanguage.toUpperCase()}</span>
        </div>
        <h3 className="text-lg font-bold text-white">{educationPlan.summary.headline}</h3>
        <p className="text-sm text-secondary leading-relaxed">{educationPlan.summary.summaryText}</p>
        <div className="explainability-box bg-tertiary p-3 rounded-md">
          <strong className="text-xs text-accent">Key Action Message: </strong>
          <span className="text-xs text-white">{educationPlan.summary.keyActionMessage}</span>
        </div>
      </div>

      {/* Red Flag Warnings */}
      <div className="card p-6 bg-danger-bg border border-danger/30 space-y-3">
        <h4 className="text-sm font-bold text-danger flex items-center gap-2">
          <AlertOctagon className="w-5 h-5" /> Warning Symptoms Requiring Immediate Care
        </h4>
        <ul className="list-disc pl-5 text-xs text-danger/90 space-y-1">
          {educationPlan.actionPlan.redFlagSymptoms.map((flag, idx) => (
            <li key={idx}>{flag}</li>
          ))}
        </ul>
        <p className="text-xs text-danger font-semibold pt-2 border-t border-danger/20">
          {educationPlan.actionPlan.emergencyContactInstructions}
        </p>
      </div>

      {/* Diet & Exercise Guidance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Salad className="w-4 h-4 text-success" /> Dietary Guidance: {educationPlan.lifestylePlan.diet.category}
          </h4>
          <p className="text-xs text-secondary font-medium">{educationPlan.lifestylePlan.diet.primaryFocus}</p>
          <div className="text-xs space-y-1">
            <div className="text-success font-semibold">Recommended Foods:</div>
            <p className="text-secondary">{educationPlan.lifestylePlan.diet.recommendedFoods.join(', ')}</p>
          </div>
          <div className="text-xs space-y-1">
            <div className="text-danger font-semibold">Foods to Limit / Avoid:</div>
            <p className="text-secondary">{educationPlan.lifestylePlan.diet.foodsToAvoid.join(', ')}</p>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> Physical Activity: {educationPlan.lifestylePlan.exercise.type}
          </h4>
          <p className="text-xs text-secondary font-medium">Frequency: {educationPlan.lifestylePlan.exercise.weeklyFrequency} ({educationPlan.lifestylePlan.exercise.durationMinutesPerSession} mins/session)</p>
          <div className="text-xs space-y-1">
            <div className="text-warning font-semibold">Precautions:</div>
            <ul className="list-disc pl-4 text-secondary">
              {educationPlan.lifestylePlan.exercise.precautions.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
