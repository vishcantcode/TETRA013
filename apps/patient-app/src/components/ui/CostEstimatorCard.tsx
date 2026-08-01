import React from 'react';
import { IndianRupee, ShieldCheck, Info } from 'lucide-react';
import { CustomerExperienceUtils } from '../../utils/CustomerExperience';

export const CostEstimatorCard: React.FC = () => {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex-between">
        <div className="flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-accent" />
          <h4 className="text-sm font-bold text-white">Diagnostic Test Cost Estimator (India)</h4>
        </div>
        <span className="badge badge-success flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Ayushman Bharat (PM-JAY) Eligible
        </span>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Diagnostic Investigation</th>
              <th>LOINC Code</th>
              <th>Govt PHC / CHC Cost</th>
              <th>Private Lab Est. Cost</th>
              <th>Ayushman Coverage</th>
            </tr>
          </thead>
          <tbody>
            {CustomerExperienceUtils.testCosts.map((test, idx) => (
              <tr key={idx}>
                <td className="font-semibold text-white text-xs">{test.testName}</td>
                <td className="text-2xs text-secondary font-mono">{test.loincCode}</td>
                <td className="font-bold text-success text-xs">{test.govtPhcPrice}</td>
                <td className="text-xs text-secondary">{test.privateLabPrice}</td>
                <td>
                  <span className="badge badge-accent">100% Covered</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-2xs text-secondary bg-tertiary p-2 rounded">
        <Info className="w-4 h-4 text-accent shrink-0" />
        <span>All essential diagnostic tests for hypertension, diabetes, and kidney health are provided <strong>FREE of cost</strong> at Government Primary Health Centres (PHCs) under National Health Mission (NHM).</span>
      </div>
    </div>
  );
};
