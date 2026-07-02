import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/useAuthStore';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
