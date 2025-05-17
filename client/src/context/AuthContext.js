import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Получение данных пользователя из локального хранилища при загрузке
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Устанавливаем токен в заголовок для всех запросов
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Получаем данные пользователя
          const response = await api.get('/api/auth/me');
          setCurrentUser(response.data.user);
        } catch (error) {
          console.error('Ошибка при загрузке пользователя:', error);
          // Если токен истек или некорректен - удаляем его
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Регистрация пользователя
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Отправляемые данные:', userData); // Добавьте для отладки
    
      // Убедитесь, что все обязательные поля присутствуют
      const requiredFields = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      };
      
      const response = await api.post('/api/auth/register', requiredFields);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка регистрации';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Авторизация пользователя
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError(error.response?.data?.message || 'Ошибка входа');
      setLoading(false);
      return { success: false, error: error.response?.data?.message || 'Ошибка входа' };
    }
  };

  // Выход из системы
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    }
  };

  // Проверка, является ли пользователь администратором
  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};