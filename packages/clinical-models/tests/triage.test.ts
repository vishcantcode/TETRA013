import { describe, it, expect } from 'vitest';
import { QuestionFlowEngine } from '../src/triage/question-engine';

describe('Triage Question Flow Engine', () => {
  it('generates fever follow-ups', () => {
    const engine = new QuestionFlowEngine();
    const questions = engine.determineNextQuestions([{ id: '1', symptom: 'I have a high fever', timestamp: new Date() }]);
    
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].text).toContain('fever');
  });
});
