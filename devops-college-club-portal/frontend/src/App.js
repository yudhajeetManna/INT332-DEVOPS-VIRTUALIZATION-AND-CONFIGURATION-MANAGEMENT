import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import ClubsPage from './pages/ClubsPage';
import EventsPage from './pages/EventsPage';
import LeaderDashboard from './pages/LeaderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const RoleRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'leader') return <Navigate to="/leader" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><RoleRoute /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/clubs" element={<PrivateRoute><ClubsPage /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
          <Route path="/leader" element={<PrivateRoute roles={['leader', 'admin']}><LeaderDashboard /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
