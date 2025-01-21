import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRoles?: string[];  // Los roles requeridos para acceder a la ruta
};

const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { data: user, isLoading, isError } = useAuth();
  

  // Si está cargando, muestra un indicador de carga
  if (isLoading) return <LoadingSpinner/>;

  // Si hay un error o no hay un usuario autenticado, redirige al login
  if (isError || !user) return <Navigate to="/auth/login" />;

  // Verifica si el usuario tiene alguno de los roles requeridos
  const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.some(requiredRole => user?.roles!.some(role => role?.name === requiredRole));

  // Si no tiene el rol requerido, redirige a una página de Acceso Denegado
  if (!hasRequiredRole) return <Navigate to="/unauthorized" />;

  return (<>{children}</>)
};

export default ProtectedRoute;
