import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { PageSkeleton, EmptyState, ErrorState } from '../components/LoadingStates';
import { Activity, Pill, HeartPulse, FileText, Filter } from 'lucide-react';

const Timeline = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const fetchTimeline = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.timeline();
      setEvents(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load timeline');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchTimeline} />;

  const filteredEvents = filter === 'ALL' ? events : events.filter(e => e.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'MEDICATION': return <Pill size={14} color="var(--success)" />;
      case 'ASSESSMENT': return <FileText size={14} color="var(--info)" />;
      case 'ENCOUNTER': return <HeartPulse size={14} color="var(--accent)" />;
      default: return <Activity size={14} color="var(--text-secondary)" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'MEDICATION': return 'var(--success)';
      case 'ASSESSMENT': return 'var(--info)';
      case 'ENCOUNTER': return 'var(--accent)';
      default: return 'var(--border)';
    }
  };

  return (
    <div className="flex-col gap-4 animate-in">
      <header className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Health Timeline</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your comprehensive health history</p>
        </div>
        <div className="flex gap-2">
          <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Events</option>
              <option value="MEDICATION">Medications</option>
              <option value="ASSESSMENT">Assessments</option>
              <option value="ENCOUNTER">Encounters</option>
            </select>
          </div>
        </div>
      </header>

      {events.length === 0 ? (
        <EmptyState 
          icon={Activity} 
          title="No timeline events" 
          description="Your health events will appear here once you start using the platform."
        />
      ) : (
        <div className="card">
          <div className="card-body">
            {filteredEvents.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No events match the selected filter.</p>
            ) : (
              <div className="timeline" style={{ marginTop: '1rem' }}>
                {filteredEvents.map((event, idx) => (
                  <div key={idx} className="timeline-item slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="timeline-dot" style={{ borderColor: getBorderColor(event.type) }}>
                      {getIcon(event.type)}
                    </div>
                    <div className="timeline-content">
                      <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{event.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(event.date).toLocaleString()}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{event.description}</p>
                      {event.metadata && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
