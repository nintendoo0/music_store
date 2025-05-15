import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RecordingCard from '../components/RecordingCard';

const RecordingList = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const response = await api.get('/api/recordings');
        setRecordings(response.data);
        
        // Извлечение уникальных жанров
        const uniqueGenres = [...new Set(response.data.map(item => item.genre))];
        setGenres(uniqueGenres);
        
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке записей.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRecordings();
  }, []);

  // Фильтрация записей
  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         recording.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === '' || recording.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

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
      <h1 className="mb-4">Каталог записей</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Поиск по названию или исполнителю..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">Все жанры</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <Link to="/add-recording" className="btn btn-success w-100">
            Добавить запись
          </Link>
        </div>
      </div>

      {filteredRecordings.length === 0 ? (
        <div className="alert alert-info">
          Записи не найдены. Попробуйте изменить параметры поиска.
        </div>
      ) : (
        <div className="row">
          {filteredRecordings.map(recording => (
            <div key={recording.id} className="col-md-3 mb-4">
              <RecordingCard recording={recording} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordingList;