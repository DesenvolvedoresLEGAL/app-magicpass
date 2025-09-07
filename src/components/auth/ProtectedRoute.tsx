import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserOnboarding } from './UserOnboarding';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, userRole, organizationId, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Security fix: Handle users without proper profile setup
  if (user && (!userRole || !organizationId)) {
    return (
      <UserOnboarding 
        userEmail={user.email || ''} 
        onComplete={() => signOut()} 
      />
    );
  }

  if (requiredRole && userRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(userRole)) {
      // Redirect based on user role
      if (userRole === 'legal_admin') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'client_admin' || userRole === 'client_operator') {
        return <Navigate to="/client" replace />;
      }
      return <Navigate to="/auth" replace />;
    }
  }

  return <>{children}</>;
}