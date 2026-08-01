import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { PageSkeleton, EmptyState, ErrorState } from '../components/LoadingStates';
import { ShieldAlert, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const Preventive = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreventive = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.preventive.assessment();
      setData(res);
    } catch (err: any) {
      if (err.status === 404) {
         setData(null);
      } else {
         setError(err.message || 'Failed to load preventive data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreventive();
  }, []);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchPreventive} />;

  if (!data) {
    return (
      <div className="flex-col gap-4 animate-in">
        <header style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Preventive Health</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Identify and manage health risks</p>
        </header>
        <EmptyState 
          icon={ShieldAlert} 
          title="No preventive data available" 
          description="We need more health data to generate your preventive health profile. Take a health assessment to get started."
        />
      </div>
    );
  }

  return (
    <div className="flex-col gap-4 animate-in">
      <header className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Preventive Health</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Last updated: {new Date(data.date || Date.now()).toLocaleDateString()}</p>
        </div>
      </header>

      <div className="grid grid-3">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Overall Risk Score</h3>
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `conic-gradient(var(--warning) ${data.overallRiskScore}%, var(--bg-tertiary) 0)` }}>
            <div style={{ width: '100px', height: '100px', background: 'var(--bg-glass)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700 }}>{data.overallRiskScore}</span>
            </div>
          </div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Higher score indicates higher risk</p>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title flex align-center gap-2"><AlertTriangle size={20} color="var(--warning)" /> Risk Factors</h3>
          </div>
          <div className="card-body">
            {data.riskFactors?.length > 0 ? (
              <div className="flex-col gap-2">
                {data.riskFactors.map((factor: any, idx: number) => (
                  <div key={idx} className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{factor.factor}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{factor.description || 'Identified risk factor'}</div>
                    </div>
                    <div className={`badge ${factor.severity === 'HIGH' ? 'badge-danger' : factor.severity === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`}>
                      {factor.severity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No significant risk factors identified.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <h3 className="card-title flex align-center gap-2"><CheckCircle size={20} color="var(--success)" /> Recommended Interventions</h3>
        </div>
        <div className="card-body">
          {data.recommendedInterventions?.length > 0 ? (
            <div className="grid grid-2">
              {data.recommendedInterventions.map((intervention: any, idx: number) => (
                <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{intervention.description || intervention}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No specific interventions recommended at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preventive;
