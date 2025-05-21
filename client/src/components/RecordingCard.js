import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RecordingCard = ({ recording }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = !imageError && recording.imageUrl 
    ? `/uploads/${recording.imageUrl}`
    : `https://via.placeholder.com/250x250.png?text=${recording.title}`;

  // Используем данные о наличии из recording.availability
  const stores = recording.availability || [];

  return (
    <div className="card h-100 recording-card">
      {recording.imageUrl && (
        <img
          src={imageUrl}
          className="card-img-top"
          alt={recording.title}
          style={{ height: "180px", objectFit: "cover" }}
          onError={handleImageError}
        />
      )}
      <div className="card-body">
        <h5 className="card-title">{recording.title}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{recording.artist}</h6>
        <p className="card-text">
          <span className="badge bg-secondary me-2">{recording.genre}</span>
          <small className="text-muted">{recording.releaseYear}</small>
        </p>
        <Link to={`/recordings/${recording.id}`} className="btn btn-outline-primary mb-2">
          Подробнее
        </Link>
        {/* Информация о наличии */}
        <div>
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
  );
};

export default RecordingCard;