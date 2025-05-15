import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const AddRecording = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    subgenre: '',
    releaseYear: new Date().getFullYear(),
    publisher: '',
    mediaType: 'CD',
    retailPrice: 0,
    imageUrl: 'default.jpg'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Преобразование числовых значений
    if (name === 'releaseYear' || name === 'retailPrice') {
      processedValue = value === '' ? '' : Number(value);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Создаем URL для предпросмотра изображения
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Устанавливаем имя файла как imageUrl
      setFormData({
        ...formData,
        imageUrl: file.name
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Если есть изображение, сначала отправляем его
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        try {
          // Загрузка изображения на сервер
          await api.post('/api/upload', imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (uploadError) {
          console.error('Ошибка при загрузке изображения:', uploadError);
          // Если ошибка при загрузке, используем изображение по умолчанию
          setFormData({
            ...formData,
            imageUrl: 'default.jpg'
          });
        }
      }

      // Затем отправляем данные о записи
      const response = await api.post('/api/recordings', formData);
      setLoading(false);
      
      // Перенаправление на страницу добавленной записи
      navigate(`/recordings/${response.data.recording.id}`);
    } catch (err) {
      setError('Ошибка при добавлении записи. Пожалуйста, проверьте введенные данные.');
      setLoading(false);
      console.error('Ошибка при добавлении записи:', err);
    }
  };

  const mediaTypes = ['CD', 'Vinyl', 'Flash Drive', 'Cassette', 'Digital'];
  const genres = ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip Hop', 'Country', 'Folk', 'R&B', 'Blues', 'Other'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div>
      <h1 className="mb-4">Добавление новой записи</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="title" className="form-label">Название *</label>
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

              <div className="col-md-6 mb-3">
                <label htmlFor="artist" className="form-label">Исполнитель *</label>
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
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="genre" className="form-label">Жанр *</label>
                <select
                  className="form-select"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите жанр</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 mb-3">
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

              <div className="col-md-4 mb-3">
                <label htmlFor="releaseYear" className="form-label">Год выпуска *</label>
                <select
                  className="form-select"
                  id="releaseYear"
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={handleChange}
                  required
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="publisher" className="form-label">Издатель *</label>
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

              <div className="col-md-4 mb-3">
                <label htmlFor="mediaType" className="form-label">Тип носителя *</label>
                <select
                  className="form-select"
                  id="mediaType"
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleChange}
                  required
                >
                  {mediaTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label htmlFor="retailPrice" className="form-label">Розничная цена *</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="retailPrice"
                    name="retailPrice"
                    min="0"
                    step="0.01"
                    value={formData.retailPrice}
                    onChange={handleChange}
                    required
                  />
                  <span className="input-group-text">₽</span>
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="image" className="form-label">Изображение обложки</label>
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
              <div className="col-md-6">
                {imagePreview && (
                  <div className="mt-2">
                    <p>Предпросмотр:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      className="rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Сохранение...</span>
                  </>
                ) : (
                  'Добавить запись'
                )}
              </button>
              <Link to="/recordings" className="btn btn-outline-secondary ms-2">
                Отмена
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRecording;