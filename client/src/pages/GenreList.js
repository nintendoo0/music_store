import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import RecordingCard from '../components/RecordingCard';

const GenreList = () => {
  const { genre } = useParams();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenreRecordings = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/recordings/genre/${genre}`);
        setRecordings(response.data.recordings || []);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке записей выбранного жанра.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchGenreRecordings();
  }, [genre]);

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
      <h1 className="mb-4">Записи жанра: {genre}</h1>
      
      {recordings.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {recordings.map(recording => (
            <div key={recording.id} className="col">
              <RecordingCard recording={recording} />
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          Записей жанра "{genre}" не найдено.
        </div>
      )}

      <div className="mt-4">
        <Link to="/recordings" className="btn btn-secondary">
          Назад к каталогу
        </Link>
      </div>
    </div>
  );
};

export default GenreList;