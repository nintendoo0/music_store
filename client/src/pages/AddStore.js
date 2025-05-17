import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const AddStore = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/stores', formData);
      setLoading(false);
      
      // Перенаправление на страницу созданного магазина
      navigate(`/stores/${response.data.id}`);
    } catch (err) {
      setError('Ошибка при создании магазина. Пожалуйста, проверьте введенные данные.');
      setLoading(false);
      console.error('Ошибка при создании магазина:', err);
    }
  };

  return (
    <div className="container">
      <h1 className="mb-4">Добавление нового магазина</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Название магазина *</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">Адрес *</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Телефон *</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (123) 456-78-90"
                required
              />
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Сохранение...</span>
                  </>
                ) : (
                  'Создать магазин'
                )}
              </button>
              <Link to="/stores" className="btn btn-outline-secondary ms-2">
                Отмена
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStore;