import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login, logout, checkAuth, updateProfile } = useAuthStore();

  const handleLogin = useCallback(
    async (email, password) => {
      const user = await login(email, password);
      navigate('/');
      return user;
    },
    [login, navigate]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isManager = user?.role === 'manager' || isAdmin;
  const canModifyLeads = ['superadmin', 'admin', 'manager', 'sales_rep'].includes(user?.role);
  const canView = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    checkAuth,
    updateProfile,
    isSuperAdmin,
    isAdmin,
    isManager,
    canModifyLeads,
    canView,
  };
}
