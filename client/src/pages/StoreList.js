import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get('/api/stores');
        setStores(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке списка магазинов.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Наши магазины</h1>
      
      <div className="row">
        {stores.map(store => (
          <div key={store.id} className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{store.name}</h5>
                <p className="card-text">
                  <i className="bi bi-geo-alt-fill"></i> Адрес: {store.address}
                </p>
                <p className="card-text">
                  <i className="bi bi-telephone-fill"></i> Телефон: {store.phone}
                </p>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <Link to={`/stores/${store.id}`} className="btn btn-primary me-2">
                  Подробнее
                </Link>
                <Link to={`/stores/${store.id}/out-of-stock`} className="btn btn-outline-secondary me-2">
                  Отсутствующие записи
                </Link>
                <Link to={`/stores/${store.id}/total-sales`} className="btn btn-outline-info">
                  Продажи
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {stores.length === 0 && (
        <div className="alert alert-info">
          Список магазинов пуст
        </div>
      )}
    </div>
  );
};

export default StoreList;