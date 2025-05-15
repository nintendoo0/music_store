import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BestArtist = () => {
  const [bestArtist, setBestArtist] = useState(null);
  const [allArtists, setAllArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestArtist = async () => {
      try {
        const response = await api.get('/api/artists/bestselling');
        setBestArtist(response.data.bestsellingArtist);
        setAllArtists(response.data.allArtistsBySales || []);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных о лучшем исполнителе.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchBestArtist();
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
      <h1 className="mb-4">Исполнители по количеству продаж</h1>
      
      {!bestArtist ? (
        <div className="alert alert-info">
          Данные о продажах отсутствуют
        </div>
      ) : (
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h2 className="card-title h4 mb-0">Лучший исполнитель</h2>
              </div>
              <div className="card-body">
                <h3 className="h2 mb-3">{bestArtist.artist}</h3>
                <p className="lead">Общее количество продаж: <strong>{bestArtist.totalSales}</strong></p>
                
                {bestArtist.recordings && bestArtist.recordings.length > 0 && (
                  <div>
                    <h4 className="h5">Записи исполнителя:</h4>
                    <ul className="list-group">
                      {bestArtist.recordings.map(recording => (
                        <li key={recording.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <Link to={`/recordings/${recording.id}`}>{recording.title}</Link>
                            <span className="badge bg-secondary ms-2">{recording.genre}</span>
                          </div>
                          <span>{recording.releaseYear}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title h5 mb-0">Другие исполнители</h2>
              </div>
              <ul className="list-group list-group-flush">
                {allArtists.map((artist, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{artist.artist}</span>
                    <span className="badge bg-primary rounded-pill">{artist.totalSales}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <Link to="/bestsellers" className="btn btn-secondary me-2">
          Назад к бестселлерам
        </Link>
      </div>
    </div>
  );
};

export default BestArtist;