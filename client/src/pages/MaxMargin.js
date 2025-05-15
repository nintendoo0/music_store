import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MaxMargin = () => {
  const [marginData, setMarginData] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaxMargin = async () => {
      try {
        const response = await api.get('/api/recordings/max-margin');
        setMarginData(response.data.maxMarginRecording);
        setRecordings(response.data.allRecordingsWithMargins || []);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных о марже.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchMaxMargin();
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

  // Форматирование валюты
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
  };

  return (
    <div>
      <h1 className="mb-4">Анализ маржи</h1>
      
      {!marginData ? (
        <div className="alert alert-info">Данные о марже отсутствуют</div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">Запись с максимальной маржей</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <img 
                    src={marginData.imageUrl 
                      ? `/uploads/${marginData.imageUrl}` 
                      : `https://via.placeholder.com/300x300.png?text=${marginData.title}`}
                    className="img-fluid rounded mb-3"
                    alt={marginData.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/300x300.png?text=${marginData.title}`;
                    }}
                  />
                </div>
                <div className="col-md-8">
                  <h3>{marginData.title}</h3>
                  <h5 className="text-muted">{marginData.artist}</h5>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Розничная цена:</strong> {formatCurrency(marginData.retailPrice)}</p>
                      <p><strong>Оптовая цена:</strong> {formatCurrency(marginData.wholesalePrice)}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Маржа:</strong> {formatCurrency(marginData.margin)}</p>
                      <p><strong>Маржа (%):</strong> {marginData.marginPercentage.toFixed(2)}%</p>
                    </div>
                  </div>
                  <p><strong>Магазин:</strong> {marginData.storeName}</p>
                  <Link to={`/recordings/${marginData.recordingId}`} className="btn btn-primary">
                    Подробнее о записи
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <h3 className="mb-3">Все записи по марже (от большей к меньшей)</h3>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Название</th>
                  <th>Исполнитель</th>
                  <th>Розничная цена</th>
                  <th>Оптовая цена</th>
                  <th>Маржа</th>
                  <th>Маржа (%)</th>
                  <th>Магазин</th>
                </tr>
              </thead>
              <tbody>
                {recordings.map((recording, index) => (
                  <tr key={`${recording.recordingId}-${recording.storeId}`}>
                    <td>{index + 1}</td>
                    <td>
                      <Link to={`/recordings/${recording.recordingId}`}>{recording.title}</Link>
                    </td>
                    <td>{recording.artist}</td>
                    <td>{formatCurrency(recording.retailPrice)}</td>
                    <td>{formatCurrency(recording.wholesalePrice)}</td>
                    <td>{formatCurrency(recording.margin)}</td>
                    <td>{recording.marginPercentage.toFixed(2)}%</td>
                    <td>
                      <Link to={`/stores/${recording.storeId}`}>{recording.storeName}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MaxMargin;