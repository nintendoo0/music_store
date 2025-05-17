import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если требуются права администратора, но у пользователя их нет
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/forbidden" replace />;
  }

  // Пользователь авторизован и имеет необходимые права
  return <Outlet />;
};

export default ProtectedRoute;