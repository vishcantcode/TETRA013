import React from 'react';
import { BarChart3, ShieldCheck, Activity, Users, AlertCircle, Package } from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';
import { TopNavigation } from '../components/TopNavigation';

export default function PopulationAnalyticsPage() {
  const { populationSnapshot } = useCDSS();

  return (
    <div className="space-y-6 animate-in">
      <TopNavigation />

      <div className="flex-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" /> Population Health Intelligence Dashboard
          </h2>
          <p className="text-xs text-secondary">
            De-identified regional disease heatmaps, screening gap analysis, and public health resource forecasts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% De-Identified PII-Free
          </span>
        </div>
      </div>

      {/* District & PHC Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 space-y-1">
          <div className="flex-between text-xs text-secondary">
            <span>Total Screened</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-white">{populationSnapshot.totalPopulationEvaluated}</div>
          <span className="text-2xs text-secondary">{populationSnapshot.region.regionName}</span>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex-between text-xs text-secondary">
            <span>High / Severe Risk</span>
            <AlertCircle className="w-4 h-4 text-danger" />
          </div>
          <div className="text-2xl font-bold text-danger">
            {populationSnapshot.region.highRiskCount + populationSnapshot.region.severeRiskCount}
          </div>
          <span className="text-2xs text-danger font-medium">Requires Specialist Intervention</span>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex-between text-xs text-secondary">
            <span>Multimorbid Overlap</span>
            <Activity className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl font-bold text-warning">{populationSnapshot.multimorbidity.multimorbidPercentage}%</div>
          <span className="text-2xs text-secondary">Patients with ≥ 2 Co-morbidities</span>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex-between text-xs text-secondary">
            <span>Quarterly Screening Delta</span>
            <Activity className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-success">+{populationSnapshot.trends.lastQuarterScreeningImprovementPercentage}%</div>
          <span className="text-2xs text-success font-medium">Improvement vs Last Quarter</span>
        </div>
      </div>

      {/* Disease Prevalence Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 card p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Disease Prevalence Breakdown
          </h3>

          <div className="space-y-3">
            {populationSnapshot.diseasePrevalence.map((dp) => (
              <div key={dp.diseaseId} className="space-y-1">
                <div className="flex-between text-xs">
                  <span className="text-white font-semibold">{dp.diseaseName}</span>
                  <span className="text-accent font-bold">{dp.prevalencePercentage}% ({dp.casesCount} Cases)</span>
                </div>
                <div className="w-full bg-tertiary h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${dp.prevalencePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Screening Deficits & Gap Analysis */}
        <div className="lg:col-span-6 card p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" /> Regional Screening Coverage Deficits
          </h3>

          <div className="space-y-3">
            {populationSnapshot.screeningGaps.metrics.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex-between text-xs">
                  <span className="text-white">{m.investigationName}</span>
                  <span className="text-warning font-semibold">{m.missingPercentage}% Missing Deficit</span>
                </div>
                <div className="w-full bg-tertiary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-warning h-full rounded-full transition-all duration-500"
                    style={{ width: `${m.missingPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource & Specialist Demand Forecast */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" /> Resource Demand & Screening Camp Forecast
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {populationSnapshot.resourceForecast.estimatedSpecialistVisitsNeeded.map((rf, idx) => (
            <div key={idx} className="bg-tertiary p-4 rounded-lg border border-border space-y-1">
              <div className="text-xs text-secondary">{rf.specialty}</div>
              <div className="text-xl font-bold text-white">{rf.requiredVisitsPerMonth} Visits / Month</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
