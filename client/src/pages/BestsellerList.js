import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BestsellerList = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const response = await api.get('/api/recordings/bestsellers');
        setBestsellers(response.data.bestsellers || []);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке бестселлеров.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchBestsellers();
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
      <h1 className="mb-4">Бестселлеры</h1>
      
      {bestsellers.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Название</th>
                <th>Исполнитель</th>
                <th>Жанр</th>
                <th>Продажи</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {bestsellers.map((item, index) => (
                <tr key={item.recordingId}>
                  <td>{index + 1}</td>
                  <td>{item.title}</td>
                  <td>{item.artist}</td>
                  <td>
                    <Link 
                      to={`/recordings/genre/${item.genre}`}
                      className="badge bg-primary text-decoration-none"
                    >
                      {item.genre}
                    </Link>
                  </td>
                  <td>
                    <span className="badge bg-success">{item.totalSales}</span>
                  </td>
                  <td>
                    <Link 
                      to={`/recordings/${item.recordingId}`}
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
        <div className="alert alert-info">
          Данных о бестселлерах пока нет.
        </div>
      )}

      <div className="mt-4">
        <Link to="/" className="btn btn-secondary">
          Назад на главную
        </Link>
      </div>
    </div>
  );
};

export default BestsellerList;