import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../config/AuthContext';

interface AuthGuardProps extends RouteProps {
  component: React.ComponentType<any>;
  role?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ component: Component, role, ...rest }) => {
  const { isAuthenticated, loading, role: userRole } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a spinner or any loading component
  }

  const hasAccess = !role || userRole === role;

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && hasAccess ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default AuthGuard;
