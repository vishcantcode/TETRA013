import React from 'react';
import { DiseaseFeatureAttribution, FeatureAttribution } from '@healthsense/clinical-explainability';

interface SHAPChartProps {
  diseaseName: string;
  attribution: DiseaseFeatureAttribution;
}

export const SHAPChart: React.FC<SHAPChartProps> = ({ diseaseName, attribution }) => {
  const positive = attribution?.topPositiveContributors || [];
  const negative = attribution?.topNegativeContributors || [];

  return (
    <div className="card p-4 space-y-3">
      <div className="flex-between">
        <h4 className="text-sm font-semibold text-white">Feature Attributions (SHAP) — {diseaseName}</h4>
        <span className="text-xs text-secondary">Sum: 100% Weight</span>
      </div>

      <div className="space-y-2">
        {positive.map((attr: FeatureAttribution, idx: number) => (
          <div key={idx} className="space-y-1">
            <div className="flex-between text-xs">
              <span className="text-secondary">{attr.featureName}: <strong className="text-white">{attr.value}</strong></span>
              <span className="text-danger font-semibold">+{attr.weightPercentage}% Impact</span>
            </div>
            <div className="w-full bg-tertiary h-2 rounded-full overflow-hidden">
              <div
                className="bg-danger h-full rounded-full transition-all duration-500"
                style={{ width: `${attr.weightPercentage}%` }}
              />
            </div>
          </div>
        ))}

        {negative.map((attr: FeatureAttribution, idx: number) => (
          <div key={idx} className="space-y-1">
            <div className="flex-between text-xs">
              <span className="text-secondary">{attr.featureName}: <strong className="text-white">{attr.value}</strong></span>
              <span className="text-success font-semibold">-{attr.weightPercentage}% Protective</span>
            </div>
            <div className="w-full bg-tertiary h-2 rounded-full overflow-hidden">
              <div
                className="bg-success h-full rounded-full transition-all duration-500"
                style={{ width: `${attr.weightPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
