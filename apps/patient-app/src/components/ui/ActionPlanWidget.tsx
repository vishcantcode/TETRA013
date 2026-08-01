import React from 'react';
import { CheckSquare, Calendar, HelpCircle, ArrowRight } from 'lucide-react';
import { CustomerExperienceUtils } from '../../utils/CustomerExperience';
import { useCDSS } from '../../context/CDSSContext';

export const ActionPlanWidget: React.FC = () => {
  const { riskAssessment } = useCDSS();
  const score = riskAssessment.overallRiskScore;

  const riskReasons = CustomerExperienceUtils.getRiskReasons('diabetes', score);
  const actionSteps = CustomerExperienceUtils.getActionableSteps(score);

  return (
    <div className="space-y-4">
      {/* Why Am I At Risk Card */}
      <div className="card p-4 space-y-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <HelpCircle className="w-5 h-5 text-accent" />
          <h4 className="text-sm font-bold text-white">Why Am I At Risk? — Simple Breakdown</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {riskReasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-tertiary p-2.5 rounded-md border border-border">
              <span className="text-accent font-bold">•</span>
              <span className="text-secondary">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What Should I Do Now Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TODAY ACTIONS */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-success" />
            <h4 className="text-sm font-bold text-white">What To Do TODAY</h4>
          </div>
          <div className="space-y-2 text-xs">
            {actionSteps.today.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-tertiary p-2 rounded">
                <input type="checkbox" className="mt-0.5 accent-success" />
                <span className="text-white">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* THIS WEEK ACTIONS */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <h4 className="text-sm font-bold text-white">What To Do THIS WEEK</h4>
          </div>
          <div className="space-y-2 text-xs">
            {actionSteps.thisWeek.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-tertiary p-2 rounded">
                <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span className="text-white">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
