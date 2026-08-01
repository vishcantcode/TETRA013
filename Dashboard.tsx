import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageSkeleton, EmptyState, ErrorState } from '../components/LoadingStates';
import ExplainableInsight from '../components/ExplainableInsight';
import { Activity, ShieldAlert, Pill, FileText, ArrowRight, TrendingUp, TrendingDown, HeartPulse, User } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.dashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  return (
    <div className="dashboard-container flex-col gap-6 animate-in">
      {/* Header Banner */}
      <div className="card flex-between align-center" style={{ background: 'linear-gradient(135deg, var(--surface-card) 0%, var(--surface-hover) 100%)' }}>
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'Patient'}</h1>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Here is your real-time health intelligence summary.</p>
        </div>
        <button className="btn btn-primary flex align-center gap-2" onClick={() => navigate('/triage')}>
          <Activity size={18} /> Symptom Triage
        </button>
      </div>

      {/* Main Grid */}
      {data && (
        <>
          {/* Key Vitals & Risk Metrics */}
          <div className="grid grid-3 gap-4">
            <div className="card stat-card">
              <div className="flex-between align-center text-secondary">
                <span>Adherence Score</span>
                <TrendingUp size={20} className="text-success" />
              </div>
              <div className="text-3xl font-bold style-metric">{data.adherenceScore || 100}%</div>
              <div className="text-xs text-secondary mt-1">Medications & Appointments</div>
            </div>

            <div className="card stat-card">
              <div className="flex-between align-center text-secondary">
                <span>Emerging Risk Level</span>
                <ShieldAlert size={20} className="text-warning" />
              </div>
              <div className="text-3xl font-bold style-metric">{data.riskLevel || 'LOW'}</div>
              <div className="text-xs text-secondary mt-1">Preventive Intelligence Status</div>
            </div>

            <div className="card stat-card">
              <div className="flex-between align-center text-secondary">
                <span>Active Care Plan</span>
                <FileText size={20} className="text-primary" />
              </div>
              <div className="text-3xl font-bold style-metric">{data.carePlanStatus || 'ACTIVE'}</div>
              <div className="text-xs text-secondary mt-1">{data.goalsCount || 3} Active Milestones</div>
            </div>
          </div>

          {/* AI Clinical Insights & Quick Actions */}
          <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">AI Clinical Insights</h3>
              </div>
              <div className="card-body flex-col gap-4">
                {data.insights && data.insights.length > 0 ? (
                  data.insights.map((item: any, idx: number) => {
                    const text = typeof item === 'string' ? item : (item.insight || item.title || item.text || 'Clinical Insight');
                    const conf = typeof item === 'object' && item.confidence ? item.confidence : 0.95;
                    const ev = typeof item === 'object' && item.evidence ? item.evidence : [];
                    return (
                      <ExplainableInsight key={idx} insight={text} confidence={conf} evidence={ev} />
                    );
                  })
                ) : (
                  <EmptyState title="No Urgent Alerts" description="Your health metrics are within normal baseline ranges." />
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="card-body flex-col gap-4">
                <button className="btn btn-secondary flex-between" style={{ width: '100%', padding: '1rem' }} onClick={() => navigate('/medications')}>
                  <span className="flex gap-2 align-center"><Pill size={18} /> Log Medication</span>
                  <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary flex-between" style={{ width: '100%', padding: '1rem' }} onClick={() => navigate('/care-plan')}>
                  <span className="flex gap-2 align-center"><HeartPulse size={18} /> View Care Plan</span>
                  <ArrowRight size={16} />
                </button>
                <button className="btn btn-secondary flex-between" style={{ width: '100%', padding: '1rem' }} onClick={() => navigate('/profile')}>
                  <span className="flex gap-2 align-center"><User size={18} /> Update Profile</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
