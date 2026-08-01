import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useToast } from './Toast';

export interface ExplainableInsightProps {
  insight: string;
  confidence?: number;
  evidence?: string[];
}

const ExplainableInsight: React.FC<ExplainableInsightProps> = ({ insight, confidence = 0.95, evidence = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(insight);
    setCopied(true);
    toast.success('Insight copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="explainability-box animate-in">
      <div className="flex-between">
        <div className="flex gap-2 align-center" style={{ color: 'var(--accent)' }}>
          <Brain size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Insight</span>
        </div>
        <div className="flex gap-2">
          <div className="badge badge-accent">
            {Math.round(confidence * 100)}% Confidence
          </div>
          <button className="btn-icon btn-ghost" onClick={handleCopy} title="Copy to clipboard">
            {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
      
      <p style={{ marginTop: '0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
        {insight}
      </p>

      {evidence && evidence.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ padding: 0 }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Hide Evidence' : 'View Evidence'}
          </button>
          
          {expanded && (
            <ul className="evidence-list slide-up">
              {evidence.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplainableInsight;
