import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CatalogList = () => {
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/catalog');
        setCatalogItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке каталога произведений.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchCatalog();
  }, []);
  
  // Функция для форматирования цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };
  
  // Фильтрация элементов по поиску
  const filteredItems = catalogItems.filter(item => {
    if (!item.recording) return false;
    
    return (
      item.recording.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.recording.artist?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Каталог произведений</h1>
      </div>
      
      {/* Строка поиска */}
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
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          {filteredItems.length > 0 ? (
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Исполнитель</th>
                  <th>Жанр</th>
                  <th>Тип носителя</th>
                  <th>Розничная цена</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.recording?.title || 'Название отсутствует'}</td>
                    <td>{item.recording?.artist || 'Исполнитель не указан'}</td>
                    <td>{item.recording?.genre || 'Не указан'}</td>
                    <td>{item.recording?.mediaType || 'Не указан'}</td>
                    <td>{item.retailPrice ? formatPrice(item.retailPrice) : 'Не указана'}</td>
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
          ) : (
            <div className="alert alert-info">
              {searchTerm ? 'По вашему запросу ничего не найдено' : 'Каталог произведений пуст'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogList;