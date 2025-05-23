import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RecordingCard from '../components/RecordingCard';

const Home = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/recordings');
        const items = (response.data.recordings || []).slice(0, 10);
        setRecordings(items);
        setLoading(false);
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        setLoading(false);
        console.error('Ошибка загрузки данных:', err);
      }
    };
    
    fetchData();
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
      <div className="jumbotron bg-light p-5 mb-4 rounded">
        <h1 className="display-4">Добро пожаловать в музыкальный магазин!</h1>
        <p className="lead">
          У нас представлен широкий выбор музыкальных записей различных жанров и исполнителей
        </p>
        <hr className="my-4" />
        <p>Просмотрите наш каталог и найдите любимую музыку</p>
        <Link to="/recordings" className="btn btn-primary btn-lg">
          Перейти к каталогу
        </Link>
      </div>

      <h2 className="mb-4">Популярные записи</h2>
      <div className="row">
        {recordings.map(recording => (
          <div key={recording.id} className="col-md-3 mb-4">
            <RecordingCard recording={recording} />
          </div>
        ))}
      </div>

      <div className="row mt-5">
        {/* <div className="col-md-4 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <h5 className="card-title">Популярные жанры</h5>
              <p className="card-text">Просмотрите записи по жанрам</p>
              <div className="mt-3">
                <Link to="/recordings/genre/Rock" className="btn btn-sm btn-outline-primary me-2 mb-2">
                  Рок
                </Link>
                <Link to="/recordings/genre/Pop" className="btn btn-sm btn-outline-primary me-2 mb-2">
                  Поп
                </Link>
                <Link to="/recordings/genre/Jazz" className="btn btn-sm btn-outline-primary me-2 mb-2">
                  Джаз
                </Link>
              </div>
            </div>
          </div>
        </div> */}

        <div className="col-md-4 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <h5 className="card-title">Бестселлеры</h5>
              <p className="card-text">Узнайте, какие записи пользуются наибольшей популярностью</p>
              <Link to="/recordings/bestsellers" className="btn btn-primary">
                Подробнее
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <h5 className="card-title">Наши магазины</h5>
              <p className="card-text">Найдите ближайший к вам музыкальный магазин</p>
              <Link to="/stores" className="btn btn-primary">
                Посмотреть магазины
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <h5 className="card-title">Каталог произведений</h5>
              <p className="card-text">Просмотрите полный каталог музыкальных произведений</p>
              <Link to="/catalog" className="btn btn-primary">
                Перейти к каталогу
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;