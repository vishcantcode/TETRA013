import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { CDSSProvider } from './context/CDSSContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { PageSkeleton } from './components/LoadingStates';

// Lazy-Loaded Page Components for Code Splitting & Performance
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const ClinicianDashboard = lazy(() => import('./pages/ClinicianDashboard'));
const PatientSearch = lazy(() => import('./pages/PatientSearch'));
const DigitalTwinPage = lazy(() => import('./pages/DigitalTwinPage'));
const ExplainabilityPage = lazy(() => import('./pages/ExplainabilityPage'));
const OCRUploadPage = lazy(() => import('./pages/OCRUploadPage'));
const ReferralCenterPage = lazy(() => import('./pages/ReferralCenterPage'));
const PatientEducationPage = lazy(() => import('./pages/PatientEducationPage'));
const PopulationAnalyticsPage = lazy(() => import('./pages/PopulationAnalyticsPage'));
const Settings = lazy(() => import('./pages/Settings'));

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main-content">
        <Suspense fallback={<PageSkeleton />}>
          {children}
        </Suspense>
      </main>
      <CommandPalette />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CDSSProvider>
            <Routes>
              <Route path="/auth" element={<Suspense fallback={<PageSkeleton />}><Auth /></Suspense>} />
              
              <Route path="/" element={<AppShell><Landing /></AppShell>} />
              <Route path="/landing" element={<AppShell><Landing /></AppShell>} />
              <Route path="/clinician" element={<AppShell><ClinicianDashboard /></AppShell>} />
              <Route path="/patients" element={<AppShell><PatientSearch /></AppShell>} />
              <Route path="/digital-twin" element={<AppShell><DigitalTwinPage /></AppShell>} />
              <Route path="/risk-analytics" element={<AppShell><ExplainabilityPage /></AppShell>} />
              <Route path="/explainability" element={<AppShell><ExplainabilityPage /></AppShell>} />
              <Route path="/ocr-upload" element={<AppShell><OCRUploadPage /></AppShell>} />
              <Route path="/referrals" element={<AppShell><ReferralCenterPage /></AppShell>} />
              <Route path="/education" element={<AppShell><PatientEducationPage /></AppShell>} />
              <Route path="/population-analytics" element={<AppShell><PopulationAnalyticsPage /></AppShell>} />
              <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CDSSProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
