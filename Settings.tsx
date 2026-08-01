import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Settings as SettingsIcon, Shield, Bell, LogOut, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleAction = (action: string) => {
    toast.info(`${action} will be available in a future update.`);
  };

  return (
    <div className="flex-col gap-4 animate-in">
      <header className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your account preferences</p>
        </div>
      </header>

      <div className="grid grid-2">
        <div className="flex-col gap-4">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex align-center gap-2"><Shield size={20} /> Security</h2>
            </div>
            <div className="card-body flex-col gap-2">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Logged in as <strong>{user?.email}</strong></p>
              <button className="btn btn-secondary" style={{ width: 'fit-content' }} onClick={() => handleAction('Change password')}>
                Change Password
              </button>
              <button className="btn btn-secondary" style={{ width: 'fit-content' }} onClick={() => handleAction('Two-factor authentication')}>
                Enable 2FA
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex align-center gap-2"><Bell size={20} /> Notifications</h2>
            </div>
            <div className="card-body flex-col gap-2">
              <label className="flex align-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontSize: '0.875rem' }}>Email Notifications</span>
              </label>
              <label className="flex align-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontSize: '0.875rem' }}>SMS Alerts</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex-col gap-4">
          <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="card-header">
              <h2 className="card-title flex align-center gap-2" style={{ color: 'var(--danger)' }}>
                <AlertTriangle size={20} /> Danger Zone
              </h2>
            </div>
            <div className="card-body flex-col gap-4">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="btn btn-danger" style={{ width: 'fit-content' }} onClick={() => handleAction('Delete account')}>
                Delete Account
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body flex-between">
              <div>
                <div style={{ fontWeight: 500 }}>Log Out</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>End your current session</div>
              </div>
              <button className="btn btn-ghost" onClick={logout}>
                <LogOut size={20} />
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '2rem' }}>
            HealthSense v1.0.0 (Production)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
