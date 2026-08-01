import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { CardSkeleton } from '../components/LoadingStates';
import { Users, UserPlus, Search, Stethoscope, Activity, FileText, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ClinicianDashboard() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDetail, setPatientDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [search, setSearch] = useState('');

  const toast = useToast();

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await api.clinician.patients();
      setPatients(data.patients || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load patient roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSelectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    setDetailLoading(true);
    try {
      const detail = await api.clinician.patientDetail(patient.id);
      setPatientDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load patient detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleInvitePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.clinician.invite(inviteEmail);
      toast.success(`Invitation created! Code: ${res.invitation?.invite_code}`);
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
    }
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Clinician Patient Roster & Command Portal
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Real-time Digital Twin inspection, clinical decision support & care plan management
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
          <UserPlus size={16} /> Invite Patient
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1fr 1.5fr' : '1fr', gap: '1.5rem' }}>
        {/* PATIENT ROSTER COLUMN */}
        <div className="card">
          <div className="card-header flex-between">
            <h3 className="card-title">Assigned Patients ({filteredPatients.length})</h3>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search patient..."
                style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.85rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <CardSkeleton />
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              <Users size={32} color="var(--text-tertiary)" />
              <p style={{ color: 'var(--text-tertiary)' }}>No patients found in roster.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const riskScore = p.twin_state?.risk?.factors?.length ? Math.min(100, p.twin_state.risk.factors.length * 20) : 10;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div className="flex-between">
                      <div>
                        <h4 style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>
                          {p.first_name} {p.last_name}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{p.email} • DOB: {p.date_of_birth}</span>
                      </div>
                      <ChevronRight size={18} color={isSelected ? 'var(--accent)' : 'var(--text-tertiary)'} />
                    </div>

                    <div className="flex-between" style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Twin Version: <strong>v{p.twin_version || 1}</strong>
                      </span>
                      <span className={`badge ${riskScore > 50 ? 'badge-danger' : riskScore > 20 ? 'badge-warning' : 'badge-success'}`}>
                        Risk Score: {riskScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SELECTED PATIENT DETAIL INSPECTOR */}
        {selectedPatient && (
          <div className="card">
            <div className="card-header flex-between">
              <div>
                <h3 className="card-title">{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Patient ID: {selectedPatient.id} • {selectedPatient.gender}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPatient(null)}>✕ Close</button>
            </div>

            {detailLoading ? (
              <CardSkeleton />
            ) : patientDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Active Care Plan */}
                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-light)' }}>
                    <Stethoscope size={16} /> Active Care Plan
                  </h4>
                  {patientDetail.carePlan ? (
                    <div>
                      <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
                        Status: {patientDetail.carePlan.status.toUpperCase()}
                      </span>
                      <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {(patientDetail.carePlan.goals || []).map((g: any, i: number) => (
                          <li key={i}>{g.title || g}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: 0 }}>No active care plan enrolled.</p>
                  )}
                </div>

                {/* Medications List */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Prescribed Medications</h4>
                  {patientDetail.medications?.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No active prescriptions.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {patientDetail.medications.map((m: any) => (
                        <div key={m.id} className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{m.name}</strong> ({m.dosage})
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{m.frequency}</div>
                          </div>
                          <span className={`badge ${m.active ? 'badge-success' : 'badge-ghost'}`}>
                            {m.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Assessments History */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Clinical Assessment History</h4>
                  {patientDetail.assessments?.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No triage or health assessments recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {patientDetail.assessments.map((a: any) => (
                        <div key={a.id} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          <div className="flex-between">
                            <strong style={{ color: 'var(--accent-light)' }}>{a.assessment_type}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                            {a.decision?.draft?.explanation || 'Assessment completed.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* INVITE PATIENT MODAL */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '450px' }}>
            <div className="card-header flex-between">
              <h3 className="card-title">Invite New Patient</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleInvitePatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="input-group">
                <label>Patient Email Address</label>
                <input
                  type="email"
                  className="input"
                  required
                  placeholder="patient@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
