import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  Cpu,
  Eye,
  FileUp,
  Stethoscope,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  Compass,
  Search,
  Sparkles,
  Building2,
  Bell
} from 'lucide-react';
import { useCDSS } from '../context/CDSSContext';

export default function Sidebar() {
  const { setIsCommandPaletteOpen } = useCDSS();

  const navItems = [
    { to: '/landing', label: 'Overview Landing', icon: Compass },
    { to: '/clinician', label: 'Clinician Workstation', icon: LayoutDashboard },
    { to: '/patients', label: 'Patient Directory', icon: Users },
    { to: '/digital-twin', label: 'Digital Twin Model', icon: Cpu },
    { to: '/risk-analytics', label: 'Multi-Organ Risk', icon: Activity },
    { to: '/explainability', label: 'Explainability & SHAP', icon: Eye },
    { to: '/ocr-upload', label: 'OCR Intelligence', icon: FileUp },
    { to: '/referrals', label: 'Referral Center', icon: Stethoscope },
    { to: '/education', label: 'Patient Health Coaching', icon: BookOpen },
    { to: '/population-analytics', label: 'Population Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Platform Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      {/* Sidebar Header & Workspace Selector */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-glow border border-accent/30 text-accent">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
              HealthSense AI <span className="badge badge-accent text-2xs px-1.5 py-0">v1.0</span>
            </div>
            <div className="text-2xs text-secondary flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-accent" /> Gandhinagar Rural PHC
            </div>
          </div>
        </div>

        {/* Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full text-left p-2 rounded-xl bg-surface border border-border text-2xs text-secondary hover:text-white flex-between transition-all"
        >
          <span className="flex items-center gap-1.5"><Search className="w-3.5 h-3.5 text-accent" /> Search (Cmd+K)...</span>
          <kbd className="px-1.5 py-0.5 bg-card rounded text-2xs font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        <div className="sidebar-section text-2xs font-bold text-tertiary px-4 py-1 uppercase tracking-wider">Clinical Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom AI Status & User Profile Card */}
      <div className="p-3 border-t border-border bg-card/40 space-y-2 rounded-b-2xl">
        <div className="flex-between bg-surface p-2 rounded-xl border border-border text-2xs">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-white font-medium">AI Engine Ready</span>
          </div>
          <span className="text-secondary font-mono">12ms</span>
        </div>

        <div className="flex items-center gap-2.5 p-2">
          <div className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs shadow-sm">
            DA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">Dr. Ananya Sharma</div>
            <div className="text-2xs text-secondary truncate">Chief Medical Officer</div>
          </div>
          <button className="p-1 rounded-lg text-secondary hover:text-white hover:bg-surface transition-all">
            <Bell className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
