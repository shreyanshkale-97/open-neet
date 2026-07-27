import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AiGeneratorPage } from '../pages/AiGeneratorPage';
import { TestInterfacePage } from '../pages/TestInterfacePage';
import { TestResultPage } from '../pages/TestResultPage';
import { OwnPaperModePage } from '../pages/OwnPaperModePage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/ai-generator" element={
          <ProtectedRoute>
            <AiGeneratorPage />
          </ProtectedRoute>
        } />

        <Route path="/own-paper" element={
          <ProtectedRoute>
            <OwnPaperModePage />
          </ProtectedRoute>
        } />

        <Route path="/test/:id" element={
          <ProtectedRoute>
            <TestInterfacePage />
          </ProtectedRoute>
        } />

        <Route path="/test/:id/result" element={
          <ProtectedRoute>
            <TestResultPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;