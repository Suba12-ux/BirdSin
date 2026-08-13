import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Loader';

/** Защищённый маршрут — только для авторизованных. */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

/** Публичный маршрут — редиректит на главную (/), если уже авторизован. */
export function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (user) return <Navigate to="/" replace />;

  return children;
}
