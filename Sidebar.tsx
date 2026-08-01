import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Activity, HeartPulse, Pill, ShieldAlert,
  Brain, User, Settings, LogOut, FileText, Shield, Stethoscope
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'patient';

  let navGroups = [];

  if (role === 'admin') {
    navGroups = [
      {
        title: 'Administration',
        links: [
          { to: '/admin', icon: Shield, label: 'Admin Portal' },
          { to: '/clinician', icon: Stethoscope, label: 'Patient Roster' },
        ]
      },
      {
        title: 'Health Services',
        links: [
          { to: '/', icon: LayoutDashboard, label: 'My Dashboard' },
          { to: '/assessment', icon: Brain, label: 'Health Assessment' },
          { to: '/records', icon: FileText, label: 'Medical Records' },
        ]
      },
      {
        title: 'Account',
        links: [
          { to: '/profile', icon: User, label: 'Profile' },
          { to: '/settings', icon: Settings, label: 'Settings' }
        ]
      }
    ];
  } else if (role === 'clinician') {
    navGroups = [
      {
        title: 'Clinician Portal',
        links: [
          { to: '/clinician', icon: Stethoscope, label: 'Patient Roster' },
          { to: '/', icon: LayoutDashboard, label: 'My Overview' },
        ]
      },
      {
        title: 'Clinical AI',
        links: [
          { to: '/assessment', icon: Brain, label: 'Health Assessment' },
          { to: '/records', icon: FileText, label: 'Medical Records' },
        ]
      },
      {
        title: 'Account',
        links: [
          { to: '/profile', icon: User, label: 'Profile' },
          { to: '/settings', icon: Settings, label: 'Settings' }
        ]
      }
    ];
  } else {
    navGroups = [
      {
        title: 'Overview',
        links: [
          { to: '/', icon: LayoutDashboard, label: 'Dashboard' }
        ]
      },
      {
        title: 'Health',
        links: [
          { to: '/timeline', icon: Activity, label: 'Timeline' },
          { to: '/care-plan', icon: HeartPulse, label: 'Care Plan' },
          { to: '/medications', icon: Pill, label: 'Medications' },
          { to: '/preventive', icon: ShieldAlert, label: 'Preventive' },
          { to: '/records', icon: FileText, label: 'Medical Records' }
        ]
      },
      {
        title: 'AI Services',
        links: [
          { to: '/assessment', icon: Brain, label: 'Health Assessment' }
        ]
      },
      {
        title: 'Account',
        links: [
          { to: '/profile', icon: User, label: 'Profile' },
          { to: '/settings', icon: Settings, label: 'Settings' }
        ]
      }
    ];
  }

  const roleBadgeClass = role === 'admin' ? 'badge-danger' : role === 'clinician' ? 'badge-info' : 'badge-accent';

  return (
    <aside className="sidebar" role="navigation" aria-label="Main Navigation">
      <div className="sidebar-header">
        <div style={{ background: 'var(--accent)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
          <HeartPulse size={24} color="white" aria-hidden="true" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, #fafafa, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          HealthSense
        </h2>
      </div>

      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email?.split('@')[0]}
            </div>
            <div className={`badge ${roleBadgeClass}`} style={{ marginTop: '0.2rem', textTransform: 'capitalize' }}>
              {role}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
        {navGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '1rem' }}>
            <div className="sidebar-section">{group.title}</div>
            {group.links.map(link => (
              <NavLink 
                key={link.to} 
                to={link.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                aria-current={link.to === window.location.pathname ? 'page' : undefined}
              >
                <link.icon size={18} aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <button 
          className="sidebar-link" 
          onClick={logout} 
          aria-label="Log out of HealthSense"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
