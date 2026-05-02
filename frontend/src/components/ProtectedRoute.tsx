import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../api';

type Role = 'admin' | 'hr_officer' | 'payroll_officer' | 'employee';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const home =
      user.role === 'admin' ? '/admin' :
      user.role === 'hr_officer' ? '/hr' :
      user.role === 'payroll_officer' ? '/payroll' :
      '/employee';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
