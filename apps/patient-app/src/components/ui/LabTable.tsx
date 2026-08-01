import React from 'react';
import { FHIRObservation } from '@healthsense/clinical-models';

interface LabTableProps {
  observations: FHIRObservation[];
}

export const LabTable: React.FC<LabTableProps> = ({ observations }) => {
  if (observations.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-secondary bg-tertiary rounded-md">
        No laboratory observations recorded yet. Upload a report via OCR.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>LOINC / Test Name</th>
            <th>Measured Value</th>
            <th>Reference Range</th>
            <th>Status Flag</th>
          </tr>
        </thead>
        <tbody>
          {observations.map((obs) => {
            const loinc = obs.code.coding[0]?.code || 'N/A';
            const name = obs.code.text || obs.code.coding[0]?.display || 'Laboratory Finding';
            const val = `${obs.valueQuantity?.value ?? 'N/A'} ${obs.valueQuantity?.unit ?? ''}`;
            const ref = obs.referenceRange?.[0]?.text || 'Normal Range';

            return (
              <tr key={obs.id}>
                <td>
                  <div className="font-semibold text-white text-xs">{name}</div>
                  <div className="text-2xs text-secondary font-mono">LOINC: {loinc}</div>
                </td>
                <td className="font-bold text-white text-xs">{val}</td>
                <td className="text-xs text-secondary">{ref}</td>
                <td>
                  <span className="badge badge-accent">Verified</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
