import { SymptomObservation, FollowUpQuestion } from './domain';

export class QuestionFlowEngine {
  determineNextQuestions(symptoms: SymptomObservation[]): FollowUpQuestion[] {
    const questions: FollowUpQuestion[] = [];
    
    const hasFever = symptoms.some(s => s.symptom.toLowerCase().includes('fever'));
    if (hasFever) {
      questions.push({
        id: crypto.randomUUID(),
        type: 'single',
        text: 'How high is your fever?',
        options: ['Below 100.4F', '100.4F - 102F', 'Above 102F']
      });
    }

    const hasPain = symptoms.some(s => s.symptom.toLowerCase().includes('pain'));
    if (hasPain) {
      questions.push({
        id: crypto.randomUUID(),
        type: 'single',
        text: 'How severe is the pain on a scale of 1-10?',
        options: ['1-3', '4-6', '7-10']
      });
    }

    return questions;
  }
}
