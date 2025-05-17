import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
      </div>
      <h1 className="display-4">404</h1>
      <h2 className="mb-4">Страница не найдена</h2>
      <p className="lead mb-4">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <Link to="/" className="btn btn-primary">
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;