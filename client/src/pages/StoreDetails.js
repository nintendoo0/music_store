import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const StoreDetails = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const response = await api.get(`/api/stores/${id}`);
        console.log('Данные, полученные с сервера:', response.data);
        setStore(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных о магазине.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStoreDetails();
  }, [id]);

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

  if (!store) {
    return <div className="alert alert-warning">Магазин не найден</div>;
  }

  return (
    <div>
      <h1 className="mb-4">{store.name}</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Информация о магазине</h5>
          <p><strong>Адрес:</strong> {store.address}</p>
          <p><strong>Телефон:</strong> {store.phone}</p>
        </div>
      </div>

      <h2 className="mb-3">Инвентарь магазина</h2>
      {store.inventory && store.inventory.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>Название</th>
                <th>Исполнитель</th>
                <th>Тип носителя</th>
                <th>В наличии</th>
                <th>Продано</th>
                <th>Цена (розничная)</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {store.inventory.map(item => {
                // Проверяем структуру данных, поддерживая оба варианта
                const recording = item.recording || item.recordingDetails || {};
                
                return (
                  <tr key={item.recordingId}>
                    <td>{recording.title || 'Название отсутствует'}</td>
                    <td>{recording.artist || 'Исполнитель не указан'}</td>
                    <td>{recording.mediaType || item.mediaType || 'Не указан'}</td>
                    <td>
                      {item.inStock > 0 ? (
                        <span className="badge bg-success">{item.inStock} шт.</span>
                      ) : (
                        <span className="badge bg-danger">Нет в наличии</span>
                      )}
                    </td>
                    <td>{item.salesCount}</td>
                    <td>{item.retailPrice || 'Не указана'} ₽</td>
                    <td>
                      <Link to={`/recordings/${item.recordingId}`} className="btn btn-sm btn-outline-primary">
                        Подробнее
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">В этом магазине нет записей</div>
      )}

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Отсутствующие записи</h5>
              <p className="card-text">Просмотрите записи, которых нет в наличии</p>
              <Link to={`/stores/${id}/out-of-stock`} className="btn btn-primary">
                Просмотреть
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Статистика продаж</h5>
              <p className="card-text">Просмотрите данные о продажах в магазине</p>
              <Link to={`/stores/${id}/total-sales`} className="btn btn-primary">
                Просмотреть
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link to="/stores" className="btn btn-secondary">
          Назад к списку магазинов
        </Link>
      </div>
    </div>
  );
};

export default StoreDetails;