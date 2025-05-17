import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="container mt-5 text-center">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <i className="bi bi-shield-lock text-danger" style={{ fontSize: '5rem' }}></i>
              <h1 className="mt-3">Доступ запрещен</h1>
              <p className="lead">
                У вас нет необходимых прав для доступа к этой странице.
              </p>
              <div className="mt-4">
                <Link to="/" className="btn btn-primary me-3">
                  На главную
                </Link>
                <Link to="/login" className="btn btn-outline-secondary">
                  Войти с другой учетной записью
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;