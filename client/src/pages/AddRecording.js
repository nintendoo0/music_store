import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddRecording = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    subgenre: '',
    releaseYear: new Date().getFullYear(),
    publisher: '',
    mediaType: 'CD',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Новый обработчик для выбора файла
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFormData({
        ...formData,
        imageUrl: file.name // Сохраняем имя файла для отправки на сервер
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl;

      // 1. Если выбран файл, сначала загружаем его на сервер
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const uploadRes = await api.post('/api/upload', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.fileName;
      }

      // 2. Отправляем данные о записи, включая imageUrl (имя файла)
      await api.post('/api/recordings', {
        ...formData,
        imageUrl: imageUrl || '', // если не было файла, отправляем как есть
      });

      navigate('/recordings');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при добавлении записи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Добавление новой записи</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Название</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="artist" className="form-label">Исполнитель</label>
              <input
                type="text"
                className="form-control"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="genre" className="form-label">Жанр</label>
              <input
                type="text"
                className="form-control"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="subgenre" className="form-label">Поджанр</label>
              <input
                type="text"
                className="form-control"
                id="subgenre"
                name="subgenre"
                value={formData.subgenre}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="releaseYear" className="form-label">Год выпуска</label>
              <input
                type="number"
                className="form-control"
                id="releaseYear"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="publisher" className="form-label">Издатель</label>
              <input
                type="text"
                className="form-control"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="mediaType" className="form-label">Тип носителя</label>
              <select
                className="form-select"
                id="mediaType"
                name="mediaType"
                value={formData.mediaType}
                onChange={handleChange}
                required
              >
                <option value="CD">CD</option>
                <option value="Vinyl">Vinyl</option>
                <option value="Digital">Digital</option>
                <option value="Cassette">Cassette</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="image" className="form-label">Изображение (файл)</label>
              <input
                type="file"
                className="form-control"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="form-text">Рекомендуемый размер: 300x300 пикселей. Допустимые форматы: JPG, PNG.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="imageUrl" className="form-label">URL изображения (необязательно)</label>
              <input
                type="text"
                className="form-control"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Оставьте пустым для изображения по умолчанию"
                disabled={!!imageFile}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Сохранение...
                  </>
                ) : 'Сохранить'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/recordings')}
                disabled={loading}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRecording;