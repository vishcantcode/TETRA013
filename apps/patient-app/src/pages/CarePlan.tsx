import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { PageSkeleton, EmptyState, ErrorState } from '../components/LoadingStates';
import { HeartPulse, Target, CheckCircle, Clock } from 'lucide-react';

const CarePlan = () => {
  const [carePlan, setCarePlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarePlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.carePlan();
      setCarePlan(res);
    } catch (err: any) {
      if (err.status === 404) {
        setCarePlan(null); // No care plan
      } else {
        setError(err.message || 'Failed to load care plan');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlan();
  }, []);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchCarePlan} />;

  if (!carePlan) {
    return (
      <div className="flex-col gap-4 animate-in">
        <header style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Care Plan</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your personalized health journey</p>
        </header>
        <EmptyState 
          icon={HeartPulse} 
          title="No active care plan" 
          description="You don't have an active care plan yet. Complete a health assessment to generate one."
        />
      </div>
    );
  }

  return (
    <div className="flex-col gap-4 animate-in">
      <header className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Care Plan</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Generated on {new Date(carePlan.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
        <div className="badge badge-accent">Active</div>
      </header>

      <div className="grid grid-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h2 className="card-title flex align-center gap-2"><Target size={20} color="var(--accent)" /> Goals</h2>
          </div>
          <div className="card-body flex-col gap-4">
            {carePlan.goals?.map((goal: any, idx: number) => (
              <div key={idx} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{goal.description}</div>
                  <div className={`badge ${goal.status === 'ACHIEVED' ? 'badge-success' : 'badge-warning'}`}>
                    {goal.status}
                  </div>
                </div>
                {goal.targetDate && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex align-center gap-2"><HeartPulse size={20} color="var(--danger)" /> Conditions</h2>
          </div>
          <div className="card-body">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {carePlan.conditions?.map((cond: string, idx: number) => (
                <li key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></div>
                  {cond}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <h2 className="card-title flex align-center gap-2"><CheckCircle size={20} color="var(--success)" /> Action Items</h2>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Frequency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {carePlan.activities?.map((activity: any, idx: number) => (
                  <tr key={idx}>
                    <td>{activity.description}</td>
                    <td>{activity.frequency || 'As needed'}</td>
                    <td>
                      <div className={`badge ${activity.status === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>
                        {activity.status || 'PENDING'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarePlan;
