import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Добавляем импорт Link
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const RecordingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Будем использовать для отображения состояния удаления
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  
  useEffect(() => {
    const fetchRecording = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/recordings/${id}`);
        setRecording(response.data);
        setError(null);
      } catch (error) {
        console.error('Ошибка при получении записи:', error);
        setError('Не удалось загрузить детали записи. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecording();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      setIsDeleting(true); // Устанавливаем флаг удаления
      await api.delete(`/api/recordings/${id}`);
      navigate('/recordings');
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
      setError('Не удалось удалить запись. Пожалуйста, попробуйте позже.');
      setIsDeleting(false); // Сбрасываем флаг при ошибке
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button 
          className="btn btn-outline-primary ms-2"
          onClick={() => navigate('/recordings')}
        >
          Вернуться к списку
        </button>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="alert alert-warning" role="alert">
        Запись не найдена
        <button 
          className="btn btn-outline-primary ms-2"
          onClick={() => navigate('/recordings')}
        >
          Вернуться к списку
        </button>
      </div>
    );
  }

  const { title, artist, genre, subgenre, releaseYear, publisher, mediaType, imageUrl } = recording;

  // Получаем наличие из записи
  const stores = recording.availability || [];

  return (
    <div className="recording-details">
      <div className="card">
        <div className="row g-0">
          <div className="col-md-4">
            {imageUrl ? (
              <img 
                src={`/uploads/${imageUrl}`} 
                className="img-fluid rounded-start" 
                alt={title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/400x400/CCCCCC/333333?text=${encodeURIComponent(title)}`;
                }}
              />
            ) : (
              <div 
                className="img-placeholder rounded-start"
                style={{
                  height: '100%',
                  minHeight: '400px',
                  backgroundColor: '#e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="text-muted">Нет изображения</span>
              </div>
            )}
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/">Главная</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/recordings">Каталог записей</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {title}
                  </li>
                </ol>
              </nav>

              <h1 className="card-title mb-3">{title}</h1>
              <h5 className="card-subtitle mb-3 text-muted">{artist}</h5>

              <div className="mb-4">
                <span className="badge bg-primary me-2">{genre}</span>
                {subgenre && <span className="badge bg-secondary me-2">{subgenre}</span>}
                <span className="badge bg-info">{mediaType}</span>
              </div>

              <table className="table">
                <tbody>
                  <tr>
                    <th style={{ width: '150px' }}>Год выпуска</th>
                    <td>{releaseYear}</td>
                  </tr>
                  <tr>
                    <th>Издатель</th>
                    <td>{publisher}</td>
                  </tr>
                </tbody>
              </table>

              <div className="d-flex mt-4">
                {isAdmin() && (
                  <>
                    <Link 
                      to={`/recordings/edit/${id}`}
                      className="btn btn-primary me-2"
                    >
                      <i className="bi bi-pencil me-1"></i> Редактировать
                    </Link>
                    <button 
                      className="btn btn-danger me-2"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Удаление...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-trash me-1"></i> Удалить
                        </>
                      )}
                    </button>
                  </>
                )}
                <Link 
                  to="/recordings"
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-1"></i> Назад к списку
                </Link>
                <button className="btn btn-success ms-auto" onClick={() => addToCart({
                  recordingId: recording.id,
                  title: recording.title,
                  artist: recording.artist,
                  price: recording.catalogInfo?.retailPrice || recording.retailPrice || 0
                })}>
                  В корзину
                </button>
              </div>

              <div className="mt-4">
                <strong>Наличие в магазинах:</strong>
                {stores.length === 0 ? (
                  <div className="text-muted">Нет данных</div>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {stores.map(store => (
                      <li key={store.storeId}>
                        {store.storeName}:{" "}
                        {store.inStock > 0 ? (
                          <span className="text-success">{store.inStock} шт.</span>
                        ) : (
                          <span className="text-danger">Нет в наличии</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingDetails;