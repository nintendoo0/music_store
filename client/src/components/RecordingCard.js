import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RecordingCard = ({ recording }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  // URL для изображения: если imageUrl присутствует и нет ошибки, используем его, иначе заглушку
  const imageUrl = !imageError && recording.imageUrl 
    ? `/uploads/${recording.imageUrl}`
    : `https://via.placeholder.com/250x250.png?text=${recording.title}`;

  return (
    <div className="card recording-card h-100">
      <img 
        src={imageUrl}
        className="card-img-top" 
        alt={recording.title}
        onError={handleImageError}
      />
      <div className="card-body">
        <h5 className="card-title">{recording.title}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{recording.artist}</h6>
        <p className="card-text">
          <Link to={`/recordings/genre/${recording.genre}`} className="badge bg-primary text-decoration-none">
            {recording.genre}
          </Link>
          {recording.subgenre && (
            <span className="badge bg-secondary ms-1">{recording.subgenre}</span>
          )}
        </p>
        <p className="card-text">
          <small className="text-muted">
            {recording.releaseYear} • {recording.mediaType}
          </small>
        </p>
      </div>
      <div className="card-footer bg-transparent border-top-0 text-center">
        <Link to={`/recordings/${recording.id}`} className="btn btn-outline-primary btn-sm">
          Подробнее
        </Link>
      </div>
    </div>
  );
};

export default RecordingCard;