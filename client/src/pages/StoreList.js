import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/stores');
        setStores(response.data);
        setError(null);
      } catch (error) {
        console.error('Ошибка при получении списка магазинов:', error);
        setError('Не удалось загрузить список магазинов. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="store-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Магазины</h1>
        {isAdmin() && (
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/stores/add')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Добавить магазин
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {stores.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Адрес</th>
                    <th>Город</th>
                    <th>Телефон</th>
                    <th>Email</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(store => (
                    <tr key={store.id}>
                      <td>{store.name}</td>
                      <td>{store.address}</td>
                      <td>{store.city}</td>
                      <td>{store.phone}</td>
                      <td>{store.email}</td>
                      <td>
                        <Link 
                          to={`/stores/${store.id}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          Подробнее
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">Магазины не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreList;