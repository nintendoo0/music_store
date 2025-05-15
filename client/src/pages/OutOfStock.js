import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OutOfStock = () => {
  const { id } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOutOfStock = async () => {
      try {
        const response = await api.get(`/api/stores/${id}/out-of-stock`);
        setStoreData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных об отсутствующих записях.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchOutOfStock();
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

  if (!storeData) {
    return <div className="alert alert-warning">Данные магазина не найдены</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Отсутствующие записи в магазине</h1>
      <h2 className="h4 mb-3">{storeData.storeName}</h2>

      <nav>
        <div className="nav nav-tabs mb-3" id="nav-tab" role="tablist">
          <button 
            className="nav-link active" 
            id="nav-out-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#nav-out" 
            type="button" 
            role="tab" 
            aria-controls="nav-out" 
            aria-selected="true"
          >
            Нет в наличии ({storeData.outOfStock.length})
          </button>
          <button 
            className="nav-link" 
            id="nav-missing-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#nav-missing" 
            type="button" 
            role="tab" 
            aria-controls="nav-missing" 
            aria-selected="false"
          >
            Отсутствуют в ассортименте ({storeData.missingCompletely.length})
          </button>
        </div>
      </nav>

      <div className="tab-content" id="nav-tabContent">
        <div className="tab-pane fade show active" id="nav-out" role="tabpanel" aria-labelledby="nav-out-tab">
          {storeData.outOfStock.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Название</th>
                    <th>Исполнитель</th>
                    <th>Жанр</th>
                    <th>Продано</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {storeData.outOfStock.map(item => (
                    <tr key={item.recordingId}>
                      <td>{item.title}</td>
                      <td>{item.artist}</td>
                      <td>{item.genre}</td>
                      <td>{item.salesCount}</td>
                      <td>
                        <Link to={`/recordings/${item.recordingId}`} className="btn btn-sm btn-outline-primary">
                          Подробнее
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">Все товары есть в наличии</div>
          )}
        </div>

        <div className="tab-pane fade" id="nav-missing" role="tabpanel" aria-labelledby="nav-missing-tab">
          {storeData.missingCompletely.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Название</th>
                    <th>Исполнитель</th>
                    <th>Жанр</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {storeData.missingCompletely.map(item => (
                    <tr key={item.recordingId}>
                      <td>{item.title}</td>
                      <td>{item.artist}</td>
                      <td>{item.genre}</td>
                      <td>
                        <Link to={`/recordings/${item.recordingId}`} className="btn btn-sm btn-outline-primary">
                          Подробнее
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">Магазин имеет полный ассортимент записей</div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link to={`/stores/${id}`} className="btn btn-secondary me-2">
          Назад к магазину
        </Link>
        <Link to="/stores" className="btn btn-outline-secondary">
          К списку магазинов
        </Link>
      </div>
    </div>
  );
};

export default OutOfStock;