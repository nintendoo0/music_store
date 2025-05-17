import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UserManagement = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Проверка прав доступа
  useEffect(() => {
    if (!currentUser || !isAdmin()) {
      navigate('/forbidden');
      return;
    }

    fetchUsers();
  }, [currentUser, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError('Не удалось загрузить список пользователей.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionInProgress(true);
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      
      // Обновление локального состояния без перезагрузки всех пользователей
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
    } catch (err) {
      console.error('Ошибка при изменении роли:', err);
      setError('Не удалось изменить роль пользователя.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }
    
    try {
      setActionInProgress(true);
      await api.delete(`/api/admin/users/${userId}`);
      
      // Удаление пользователя из локального состояния
      setUsers(users.filter(user => user.id !== userId));
      
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      setError('Не удалось удалить пользователя.');
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Управление пользователями</h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/admin')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Вернуться в панель администратора
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя пользователя</th>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Фамилия</th>
                  <th>Роль</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.firstName || '-'}</td>
                    <td>{user.lastName || '-'}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* Кнопка изменения роли */}
                        {user.id !== currentUser.id && (
                          <button
                            className={`btn btn-sm ${user.role === 'admin' ? 'btn-outline-primary' : 'btn-outline-danger'}`}
                            onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                            disabled={actionInProgress}
                          >
                            {user.role === 'admin' ? 'Сделать пользователем' : 'Сделать администратором'}
                          </button>
                        )}
                        
                        {/* Кнопка удаления пользователя */}
                        {user.id !== currentUser.id && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionInProgress}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-3">
                      Пользователи не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;