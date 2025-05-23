import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка прав доступа на клиенте (дополнительная защита)
  useEffect(() => {
    if (!currentUser || !isAdmin()) {
      navigate('/forbidden');
      return;
    }

    fetchStats();
  }, [currentUser, isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
      setError('Не удалось загрузить статистику. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-dashboard container py-4">
      <h1 className="mb-4">Панель администратора</h1>
      
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <h5 className="card-title">Пользователи</h5>
              <h2 className="display-4">{stats?.users || 0}</h2>
            </div>
            <div className="card-footer d-flex">
              <span>Управление пользователями</span>
              <span className="ms-auto">
                <i className="bi bi-chevron-right"></i>
              </span>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <h5 className="card-title">Записи</h5>
              <h2 className="display-4">{stats?.recordings || 0}</h2>
            </div>
            <div className="card-footer d-flex">
              <span>Управление записями</span>
              <span className="ms-auto">
                <i className="bi bi-chevron-right"></i>
              </span>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-white h-100">
            <div className="card-body">
              <h5 className="card-title">Магазины</h5>
              <h2 className="display-4">{stats?.stores || 0}</h2>
            </div>
            <div className="card-footer d-flex">
              <span>Управление магазинами</span>
              <span className="ms-auto">
                <i className="bi bi-chevron-right"></i>
              </span>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-4">
          <div className="card bg-danger text-white h-100">
            <div className="card-body">
              <h5 className="card-title">Заказы</h5>
              <h2 className="display-4">{stats?.orders || 0}</h2>
            </div>
            <div className="card-footer d-flex">
              <span>Управление заказами</span>
              <span className="ms-auto">
                <i className="bi bi-chevron-right"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              Быстрые действия
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
                  <i className="bi bi-people me-2"></i>
                  Управление пользователями
                </button>
                <button className="btn btn-success" onClick={() => navigate('/admin/recordings')}>
                  <i className="bi bi-music-note-list me-2"></i>
                  Управление записями
                </button>
                <button className="btn btn-warning" onClick={() => navigate('/admin/stores')}>
                  <i className="bi bi-shop me-2"></i>
                  Управление магазинами
                </button>
                <button className="btn btn-info" onClick={() => navigate('/admin/reports')}>
                  <i className="bi bi-graph-up me-2"></i>
                  Отчеты
                </button>
                <button className="btn btn-warning" onClick={() => navigate('/out-of-stock')}>
                  <i className="admin-actions mt-4"></i>
                  Отсутствующие записи
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;