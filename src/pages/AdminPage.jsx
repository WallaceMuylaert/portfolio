import React, { useState, useEffect } from 'react';
import LoginPage from '../components/LoginPage';
import AdminDashboard from '../components/AdminDashboard';
import { isAuthenticated } from '../services/auth';

/**
 * Página Admin
 * Gerencia o fluxo de autenticação e exibe o dashboard quando logado.
 */
const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  if (!authenticated) {
    return <LoginPage onLoginSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard />;
};

export default AdminPage;
