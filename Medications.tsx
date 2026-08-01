import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { PageSkeleton, EmptyState, ErrorState } from '../components/LoadingStates';
import { useToast } from '../components/Toast';
import { Pill, Plus, Check } from 'lucide-react';

const Medications = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    medicationId: 'med-123', // placeholder
    name: '',
    dosage: '',
    frequency: 'DAILY'
  });

  const fetchMedications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.medications.list();
      setMedications(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load medications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.medications.enroll(formData);
      toast.success('Medication added successfully');
      setShowAdd(false);
      fetchMedications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add medication');
    }
  };

  const handleAdminister = async (id: string) => {
    try {
      await api.medications.administer({ enrollmentId: id, notes: 'Taken on time' });
      toast.success('Medication recorded successfully');
      fetchMedications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record medication');
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchMedications} />;

  return (
    <div className="flex-col gap-4 animate-in">
      <header className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Medications</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your prescriptions and adherence</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Medication
        </button>
      </header>

      {medications.length === 0 ? (
        <EmptyState 
          icon={Pill} 
          title="No medications" 
          description="You haven't added any medications yet."
          action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Medication</button>}
        />
      ) : (
        <div className="grid grid-2">
          {medications.map((med, idx) => (
            <div key={idx} className="card">
              <div className="card-header flex-between">
                <div className="flex gap-2 align-center">
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                    <Pill size={20} color="var(--accent)" />
                  </div>
                  <div>
                    <h3 className="card-title">{med.medication?.name || med.name || 'Unknown Medication'}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {med.dosage} • {med.frequency}
                    </div>
                  </div>
                </div>
                <div className={`badge ${med.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>
                  {med.status || 'ACTIVE'}
                </div>
              </div>
              <div className="card-body">
                <div className="flex-between" style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Adherence</div>
                    <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{Math.round((med.adherenceRate || 0) * 100)}%</div>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleAdminister(med.id)}
                    disabled={med.status !== 'ACTIVE'}
                  >
                    <Check size={16} /> Record Dose
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="card-header flex-between" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 className="card-title">Add Medication</h2>
              <button className="btn-icon btn-ghost" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <form onSubmit={handleEnroll} style={{ padding: '1.5rem' }} className="flex-col gap-4">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Medication Name</label>
                <input required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Lisinopril" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Dosage</label>
                <input required className="input" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} placeholder="e.g. 10mg" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Frequency</label>
                <select className="select" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                  <option value="DAILY">Daily</option>
                  <option value="TWICE_DAILY">Twice Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="AS_NEEDED">As Needed</option>
                </select>
              </div>
              <div className="flex gap-2" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Medication</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medications;
