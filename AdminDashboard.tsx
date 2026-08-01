import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { CardSkeleton } from '../components/LoadingStates';
import { Users, Shield, Activity, BarChart2, UserPlus, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'metrics' | 'analytics'>('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'clinician',
    firstName: '',
    lastName: '',
    gender: 'female',
    dateOfBirth: '1985-06-15'
  });

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, lData, mData, aData] = await Promise.all([
        api.admin.users().catch(() => ({ users: [] })),
        api.admin.audit().catch(() => ({ logs: [] })),
        api.admin.metrics().catch(() => null),
        api.admin.analytics().catch(() => null)
      ]);
      setUsers(uData.users || []);
      setLogs(lData.logs || []);
      setMetrics(mData);
      setAnalytics(aData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createUser(form);
      toast.success(`Successfully created ${form.role}: ${form.email}`);
      setShowModal(false);
      setForm({ email: '', password: '', role: 'clinician', firstName: '', lastName: '', gender: 'female', dateOfBirth: '1985-06-15' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  return (
    <div className="animate-in" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Operational Administration Portal
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            System configuration, user management, audit review & operational health diagnostics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={16} /> Create User
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <div className="flex-between">
            <span className="metric-label">Total Users</span>
            <Users size={20} color="var(--accent)" />
          </div>
          <div className="metric-value">{metrics?.db?.users || users.length}</div>
          <div className="metric-trend text-success">Active Platform Accounts</div>
        </div>

        <div className="metric-card">
          <div className="flex-between">
            <span className="metric-label">Digital Twins</span>
            <Activity size={20} color="var(--success)" />
          </div>
          <div className="metric-value">{metrics?.db?.twins || 0}</div>
          <div className="metric-trend text-info">Synchronized State Models</div>
        </div>

        <div className="metric-card">
          <div className="flex-between">
            <span className="metric-label">Audit Events</span>
            <Shield size={20} color="var(--warning)" />
          </div>
          <div className="metric-value">{logs.length}</div>
          <div className="metric-trend text-secondary">Logged Operational Actions</div>
        </div>

        <div className="metric-card">
          <div className="flex-between">
            <span className="metric-label">Telemetry Events</span>
            <BarChart2 size={20} color="var(--info)" />
          </div>
          <div className="metric-value">{analytics?.totalEvents || 0}</div>
          <div className="metric-trend text-accent">Privacy-Aware Telemetry</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('users')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        >
          <Users size={16} /> User Directory ({users.length})
        </button>
        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('audit')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        >
          <Shield size={16} /> Audit Trail ({logs.length})
        </button>
        <button
          className={`btn ${activeTab === 'metrics' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('metrics')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        >
          <Activity size={16} /> Operational Health
        </button>
        <button
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('analytics')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        >
          <BarChart2 size={16} /> Product Telemetry
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <>
          {/* TAB 1: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header flex-between">
                <h3 className="card-title">User Accounts & Roles</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['all', 'patient', 'clinician', 'admin'].map(r => (
                    <button
                      key={r}
                      className={`btn btn-sm ${filterRole === r ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => setFilterRole(r)}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                          {u.id.substring(0, 8)}...
                        </td>
                        <td style={{ fontWeight: '500' }}>{u.email}</td>
                        <td>{u.first_name ? `${u.first_name} ${u.last_name}` : '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'clinician' ? 'badge-info' : 'badge-accent'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={12} /> Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">System Audit Log</h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Resource Type</th>
                      <th>Resource ID</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                          No audit events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((l) => (
                        <tr key={l.id}>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                            {new Date(l.created_at).toLocaleString()}
                          </td>
                          <td style={{ fontWeight: '500' }}>{l.user_email || l.user_id || 'System'}</td>
                          <td><span className="badge badge-warning">{l.action}</span></td>
                          <td>{l.resource_type}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{l.resource_id}</td>
                          <td>{l.ip_address || '127.0.0.1'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: OPERATIONAL HEALTH METRICS */}
          {activeTab === 'metrics' && (
            <div className="grid grid-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Process Diagnostics</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span>Node Uptime</span>
                    <strong style={{ color: 'var(--success)' }}>{Math.floor(metrics?.uptime || 0)} seconds</strong>
                  </div>
                  <div className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span>Heap Used</span>
                    <strong>{Math.round((metrics?.memory?.heapUsed || 0) / 1024 / 1024)} MB</strong>
                  </div>
                  <div className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span>Heap Total</span>
                    <strong>{Math.round((metrics?.memory?.heapTotal || 0) / 1024 / 1024)} MB</strong>
                  </div>
                  <div className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span>External Memory</span>
                    <strong>{Math.round((metrics?.memory?.external || 0) / 1024 / 1024)} MB</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Database Storage Stats</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(metrics?.db || {}).map(([key, count]) => (
                    <div key={key} className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{key} Table Rows</span>
                      <span className="badge badge-accent">{String(count)} records</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCT TELEMETRY */}
          {activeTab === 'analytics' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Privacy-Preserving Telemetry Stream</h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Category</th>
                      <th>User Role</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.recentEvents || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                          No telemetry events recorded.
                        </td>
                      </tr>
                    ) : (
                      analytics.recentEvents.map((ev: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '500', color: 'var(--accent-light)' }}>{ev.event_name}</td>
                          <td><span className="badge badge-info">{ev.category}</span></td>
                          <td><span className="badge badge-ghost">{ev.user_role}</span></td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                            {new Date(ev.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE USER MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '500px' }}>
            <div className="card-header flex-between">
              <h3 className="card-title">Create New Platform User</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="input-group">
                <label>Account Role</label>
                <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="clinician">Clinician</option>
                  <option value="admin">Administrator</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="input"
                  required
                  placeholder="clinician@healthsense.ai"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="input"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="input"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
