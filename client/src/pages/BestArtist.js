import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RecordingCard from '../components/RecordingCard';

const BestArtist = () => {
  const [bestArtist, setBestArtist] = useState(null);
  const [allArtists, setAllArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestArtist = async () => {
      try {
        const response = await api.get('/api/artists/bestselling');
        setBestArtist(response.data.bestsellingArtist || null);
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

  if (!bestArtist) {
    return <div className="alert alert-warning">Данные о продажах отсутствуют</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Лучший исполнитель по продажам</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title">{bestArtist.artist}</h2>
          <h4 className="card-subtitle mb-2 text-muted">
            Продано записей: {bestArtist.totalSales}
          </h4>
        </div>
      </div>
      
      {bestArtist.recordings && bestArtist.recordings.length > 0 && (
        <div>
          <h3 className="mb-3">Записи исполнителя</h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {bestArtist.recordings.map(recording => (
              <div key={recording.id} className="col">
                <RecordingCard recording={recording} />
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="mt-5 mb-3">Лучшие исполнители по продажам</h3>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Исполнитель</th>
              <th>Продажи</th>
            </tr>
          </thead>
          <tbody>
            {allArtists.map((artist, index) => (
              <tr key={index} className={artist.artist === bestArtist.artist ? 'table-success' : ''}>
                <td>{index + 1}</td>
                <td>{artist.artist}</td>
                <td>{artist.totalSales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Link to="/" className="btn btn-secondary">
          Назад на главную
        </Link>
      </div>
    </div>
  );
};

export default BestArtist;