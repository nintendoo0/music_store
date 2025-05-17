import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RecordingCard from '../components/RecordingCard';

const RecordingList = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // Добавляем отсутствующие состояния для поиска и фильтрации
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/recordings');
      setRecordings(response.data);
      
      // Извлекаем уникальные жанры из полученных записей
      const uniqueGenres = [...new Set(response.data.map(item => item.genre))];
      setGenres(uniqueGenres);
      
      setError(null);
    } catch (error) {
      console.error('Ошибка при получении записей:', error);
      setError('Не удалось загрузить записи. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация записей по поиску и жанру
  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         recording.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === '' || recording.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="recording-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Каталог записей</h1>
        
        {/* Отображаем кнопку только для администраторов */}
        {isAdmin() && (
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/recordings/add')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Добавить запись
          </button>
        )}
      </div>
      
      {/* Строка поиска и фильтр */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Поиск по названию или исполнителю"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
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
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredRecordings.length > 0 ? (
            filteredRecordings.map(recording => (
              <div className="col" key={recording.id}>
                <RecordingCard recording={recording} />
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">Записи не найдены</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordingList;