import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageSkeleton } from './components/LoadingStates';
import Sidebar from './components/Sidebar';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import CarePlan from './pages/CarePlan';
import Medications from './pages/Medications';
import Preventive from './pages/Preventive';
import HealthAssessment from './pages/HealthAssessment';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MedicalRecords from './pages/MedicalRecords';
import ClinicianDashboard from './pages/ClinicianDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="shell">
        <div className="main-content flex-center"><PageSkeleton /></div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (allowedRoles && user && user.role && !allowedRoles.includes(user.role)) {
    // Redirect based on user's role if accessing unauthorized route
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'clinician') return <Navigate to="/clinician" replace />;
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'clinician') return <Navigate to="/clinician" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
          <Route path="/care-plan" element={<ProtectedRoute><CarePlan /></ProtectedRoute>} />
          <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
          <Route path="/preventive" element={<ProtectedRoute><Preventive /></ProtectedRoute>} />
          <Route path="/triage" element={<ProtectedRoute><HealthAssessment /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          <Route path="/clinician" element={<ProtectedRoute allowedRoles={['clinician', 'admin']}><ClinicianDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
