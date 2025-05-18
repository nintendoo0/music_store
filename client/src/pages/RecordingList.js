import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RecordingCard from '../components/RecordingCard';

const RecordingList = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/recordings');
        setRecordings(response.data);
        
        // Извлекаем уникальные жанры из полученных записей
        const uniqueGenres = [...new Set(
          response.data
            .map(recording => recording.genre)
            .filter(genre => genre && genre.trim() !== '')
        )].sort();
        
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

  // Фильтрация записей по поисковому запросу и жанру
  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = 
      recording.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.genre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Проверяем соответствие выбранному жанру, если жанр выбран
    const matchesGenre = !selectedGenre || recording.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Каталог записей</h1>
        
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
      
      {/* Фильтры поиска */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Поиск по названию, исполнителю или жанру"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Выпадающий список для выбора жанра */}
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">Все жанры</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        
        {/* Кнопка сброса фильтров */}
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setSearchTerm('');
              setSelectedGenre('');
            }}
          >
            Сбросить
          </button>
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
        <>
          {/* Показываем количество найденных записей */}
          <p className="text-muted mb-3">
            {selectedGenre && (
              <span className="badge bg-info me-2">Жанр: {selectedGenre}</span>
            )}
            Найдено записей: {filteredRecordings.length}
          </p>
          
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {filteredRecordings.length > 0 ? (
              filteredRecordings.map(recording => (
                <div key={recording.id} className="col">
                  <div className="card h-100">
                    {recording.imageUrl && (
                      <img 
                        src={recording.imageUrl} 
                        className="card-img-top" 
                        alt={recording.title}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{recording.title}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{recording.artist}</h6>
                      <p className="card-text">
                        <span className="badge bg-secondary me-2">{recording.genre}</span>
                        <small className="text-muted">{recording.releaseYear}</small>
                      </p>
                      <Link to={`/recordings/${recording.id}`} className="btn btn-outline-primary">
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-info">
                  Записи не найдены. Попробуйте изменить параметры поиска.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RecordingList;