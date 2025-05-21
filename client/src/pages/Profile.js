import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        password: ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { firstName, lastName, email, password } = formData;
      const res = await api.put('/api/auth/me', {
        firstName, lastName, email, password: password || undefined
      });
      setSuccess('Профиль успешно обновлен');
      setCurrentUser(res.data.user);
      setFormData({ ...formData, password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div>Загрузка...</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4">Профиль пользователя</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit} className="card p-4">
        <div className="mb-3">
          <label className="form-label">Имя пользователя</label>
          <input type="text" className="form-control" value={currentUser.username} disabled />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Имя</label>
          <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Фамилия</label>
          <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Новый пароль</label>
          <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder="Оставьте пустым, чтобы не менять" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
      <div className="mt-4">
        <Link to="/orders" className="btn btn-outline-primary">
          Мои заказы
        </Link>
      </div>
    </div>
  );
};

export default Profile;