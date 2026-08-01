import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { CardSkeleton } from '../components/LoadingStates';
import { FileText, Upload, Plus, CheckCircle, FileCheck, ShieldCheck } from 'lucide-react';

export default function MedicalRecords() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    recordType: 'lab_result',
    title: '',
    notes: '',
    summary: ''
  });

  const toast = useToast();

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await api.records.list();
      setRecords(data.records || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.records.upload({
        recordType: form.recordType,
        title: form.title,
        data: {
          notes: form.notes,
          summary: form.summary,
          uploadedAt: new Date().toISOString()
        }
      });
      toast.success('Medical document successfully uploaded & processed');
      setShowModal(false);
      setForm({ recordType: 'lab_result', title: '', notes: '', summary: '' });
      loadRecords();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document');
    }
  };

  return (
    <div className="animate-in" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Medical Records & Diagnostics Vault
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Encrypted document storage integrated with Clinical Knowledge Fabric
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Upload Record
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : records.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={40} color="var(--text-tertiary)" />
            <h3 style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>No Medical Records Uploaded</h3>
            <p style={{ color: 'var(--text-tertiary)', maxWidth: '400px' }}>
              Upload lab results, imaging reports, or consultation notes to expand your Digital Twin history.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
              <Upload size={16} /> Upload Your First Document
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          {records.map((r) => (
            <div key={r.id} className="card">
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)' }}>
                    <FileCheck size={20} color="var(--accent-light)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>{r.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      Type: {r.record_type.toUpperCase()} • {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="badge badge-success">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>

              {r.data?.notes && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {r.data.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '500px' }}>
            <div className="card-header flex-between">
              <h3 className="card-title">Upload Medical Record</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="input-group">
                <label>Document Type</label>
                <select className="select" value={form.recordType} onChange={(e) => setForm({ ...form, recordType: e.target.value })}>
                  <option value="lab_result">Lab Results (Blood, Urine, Pathology)</option>
                  <option value="imaging">Imaging (X-Ray, MRI, CT Scan)</option>
                  <option value="consultation">Consultation Note</option>
                  <option value="discharge_summary">Discharge Summary</option>
                </select>
              </div>

              <div className="input-group">
                <label>Document Title</label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Comprehensive Metabolic Panel (CMP)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Clinical Notes / Summary</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Enter any relevant findings or clinical notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload & Sync</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
