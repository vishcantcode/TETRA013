import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';
import ExplainableInsight from '../components/ExplainableInsight';
import { Brain, ArrowRight, Loader } from 'lucide-react';

const HealthAssessment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [symptoms, setSymptoms] = useState('');
  const toast = useToast();

  const handleStart = async () => {
    if (!symptoms.trim()) {
      toast.warning('Please enter your symptoms');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Simulate triage start and complete with provided symptoms
      const session = await api.triage.start();
      const res = await api.triage.complete({ 
        sessionId: session.id,
        symptoms: [symptoms]
      });
      setResult(res);
      toast.success('Assessment complete');
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete assessment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-col gap-4 animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--accent-glow)', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }}>
          <Brain size={48} color="var(--accent-light)" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>AI Health Assessment</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Describe your symptoms and our AI will provide an immediate assessment</p>
      </header>

      {!result && (
        <div className="card">
          <div className="card-body flex-col gap-4">
            <div className="input-group">
              <label>What symptoms are you experiencing?</label>
              <textarea 
                className="textarea" 
                placeholder="E.g., I've had a headache for two days and feel slightly nauseous..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                rows={5}
              />
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem' }} 
              onClick={handleStart}
              disabled={isProcessing}
            >
              {isProcessing ? <><Loader className="spinner" /> Analyzing...</> : <><Brain size={18} /> Analyze Symptoms</>}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="flex-col gap-4 slide-up">
          <div className="card" style={{ borderTop: `4px solid ${result.priority === 'HIGH' ? 'var(--danger)' : result.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'}` }}>
            <div className="card-header flex-between">
              <h2 className="card-title">Assessment Result</h2>
              <div className={`badge ${result.priority === 'HIGH' ? 'badge-danger' : result.priority === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>
                {result.priority || 'NORMAL'} PRIORITY
              </div>
            </div>
            <div className="card-body">
              <ExplainableInsight 
                insight={result.decision || 'Based on your symptoms, we recommend monitoring your condition.'}
                confidence={result.confidence || 0.89}
                evidence={result.explainability || ['Symptom match', 'Clinical guidelines']}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center" style={{ marginTop: '1rem' }}>
            <button className="btn btn-ghost" onClick={() => { setResult(null); setSymptoms(''); }}>
              Start New Assessment
            </button>
            <button className="btn btn-primary">
              View Care Plan <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthAssessment;
