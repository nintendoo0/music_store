import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const RecordingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecordingDetails = async () => {
      try {
        // Загрузка данных о записи
        const recordingResponse = await api.get(`/api/recordings/${id}`);
        setRecording(recordingResponse.data);

        // Загрузка данных из каталога
        const catalogResponse = await api.get('/api/catalog');
        const catalogItem = catalogResponse.data.find(item => item.recordingId === id);
        setCatalog(catalogItem);

        // Загрузка данных о магазинах
        const storesResponse = await api.get('/api/stores');
        const storesWithRecording = [];
        
        // Проверяем наличие записи в каждом магазине
        for (const store of storesResponse.data) {
          const storeDetailsResponse = await api.get(`/api/stores/${store.id}`);
          const inventory = storeDetailsResponse.data.inventory || [];
          const inventoryItem = inventory.find(item => item.recordingId === id);
          
          if (inventoryItem) {
            storesWithRecording.push({
              ...store,
              inventoryItem
            });
          }
        }
        
        setStores(storesWithRecording);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных о записи.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRecordingDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await api.delete(`/api/recordings/${id}`);
        navigate('/recordings');
      } catch (err) {
        setError('Ошибка при удалении записи.');
        console.error(err);
      }
    }
  };

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

  if (!recording) {
    return <div className="alert alert-warning">Запись не найдена</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{recording.title}</h1>
        <div>
          <button onClick={handleDelete} className="btn btn-danger">
            Удалить запись
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <img
            src={recording.imageUrl 
              ? `/uploads/${recording.imageUrl}` 
              : `https://via.placeholder.com/400x400.png?text=${recording.title}`}
            alt={recording.title}
            className="img-fluid rounded"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://via.placeholder.com/400x400.png?text=${recording.title}`;
            }}
          />
        </div>
        
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Информация о записи</h5>
              <table className="table">
                <tbody>
                  <tr>
                    <th>Исполнитель</th>
                    <td>{recording.artist}</td>
                  </tr>
                  <tr>
                    <th>Жанр</th>
                    <td>
                      <Link to={`/recordings/genre/${recording.genre}`} className="badge bg-primary text-decoration-none">
                        {recording.genre}
                      </Link>
                      {recording.subgenre && (
                        <span className="badge bg-secondary ms-2">{recording.subgenre}</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>Год выпуска</th>
                    <td>{recording.releaseYear}</td>
                  </tr>
                  <tr>
                    <th>Издатель</th>
                    <td>{recording.publisher}</td>
                  </tr>
                  <tr>
                    <th>Тип носителя</th>
                    <td>{recording.mediaType}</td>
                  </tr>
                  {catalog && (
                    <tr>
                      <th>Розничная цена</th>
                      <td>{catalog.retailPrice} ₽</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {stores.length > 0 ? (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Наличие в магазинах</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Магазин</th>
                        <th>В наличии</th>
                        <th>Продано</th>
                        <th>Цена</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map(store => (
                        <tr key={store.id}>
                          <td>
                            <Link to={`/stores/${store.id}`}>
                              {store.name}
                            </Link>
                          </td>
                          <td>
                            {store.inventoryItem.inStock > 0 ? (
                              <span className="badge bg-success">{store.inventoryItem.inStock} шт.</span>
                            ) : (
                              <span className="badge bg-danger">Нет в наличии</span>
                            )}
                          </td>
                          <td>{store.inventoryItem.salesCount} шт.</td>
                          <td>{catalog ? catalog.retailPrice : '-'} ₽</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">
              Запись отсутствует в магазинах
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link to="/recordings" className="btn btn-secondary">
          Назад к списку
        </Link>
      </div>
    </div>
  );
};

export default RecordingDetails;