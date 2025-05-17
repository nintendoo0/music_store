import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../services/api';

const EditRecording = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [stores, setStores] = useState([]);
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

  // Структура для хранения инвентаря по магазинам
  const [storeInventory, setStoreInventory] = useState([]);

  // Загружаем данные записи при монтировании компонента
  useEffect(() => {
    const fetchRecordingData = async () => {
      try {
        setLoading(true);
        // Загружаем данные записи
        const recordingResponse = await api.get(`/api/recordings/${id}`);
        const recordingData = recordingResponse.data;
        
        // Загружаем данные каталога
        const catalogResponse = await api.get('/api/catalog');
        const catalogItem = catalogResponse.data.find(item => item.recordingId === parseInt(id));
        
        // Заполняем форму данными
        setFormData({
          title: recordingData.title || '',
          artist: recordingData.artist || '',
          genre: recordingData.genre || '',
          subgenre: recordingData.subgenre || '',
          releaseYear: recordingData.releaseYear || new Date().getFullYear(),
          publisher: recordingData.publisher || '',
          mediaType: recordingData.mediaType || 'CD',
          retailPrice: catalogItem ? catalogItem.retailPrice : 0,
          imageUrl: recordingData.imageUrl || 'default.jpg'
        });
        
        // Если есть изображение, загружаем его для предпросмотра
        if (recordingData.imageUrl && recordingData.imageUrl !== 'default.jpg') {
          setImagePreview(`/uploads/${recordingData.imageUrl}`);
        }
        
        // Загружаем список магазинов
        const storesResponse = await api.get('/api/stores');
        setStores(storesResponse.data);
        
        // Загружаем данные об инвентаре для этой записи
        const inventoryData = [];
        for (const store of storesResponse.data) {
          try {
            const storeDetailResponse = await api.get(`/api/stores/${store.id}`);
            const inventory = storeDetailResponse.data.inventory || [];
            const inventoryItem = inventory.find(item => item.recordingId === parseInt(id));
            
            if (inventoryItem) {
              inventoryData.push({
                storeId: store.id,
                storeName: store.name,
                wholesalePrice: inventoryItem.wholesalePrice,
                inStock: inventoryItem.inStock
              });
            }
          } catch (error) {
            console.error(`Ошибка при загрузке данных о магазине ${store.id}:`, error);
          }
        }
        
        setStoreInventory(inventoryData);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных записи');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRecordingData();
  }, [id]);

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

  // Добавление магазина в список инвентаря
  const handleAddStore = () => {
    if (stores.length === 0) return;
    
    // Находим первый магазин, которого еще нет в списке
    const availableStores = stores.filter(
      store => !storeInventory.some(item => item.storeId === store.id)
    );
    
    if (availableStores.length === 0) {
      setError('Все доступные магазины уже добавлены');
      return;
    }
    
    const storeToAdd = availableStores[0];
    
    // Добавляем магазин в список с начальными значениями
    setStoreInventory([
      ...storeInventory,
      {
        storeId: storeToAdd.id,
        storeName: storeToAdd.name,
        wholesalePrice: Math.round(formData.retailPrice * 0.7), // 70% от розничной цены
        inStock: 0
      }
    ]);
  };

  // Удаление магазина из списка инвентаря
  const handleRemoveStore = (storeId) => {
    setStoreInventory(storeInventory.filter(item => item.storeId !== storeId));
  };

  // Обновление данных инвентаря для конкретного магазина
  const handleInventoryChange = (storeId, field, value) => {
    setStoreInventory(storeInventory.map(item => {
      if (item.storeId === storeId) {
        // Преобразование в число для числовых полей
        const processedValue = ['wholesalePrice', 'inStock'].includes(field)
          ? Number(value)
          : value;
          
        return { ...item, [field]: processedValue };
      }
      return item;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
          // Если ошибка при загрузке, оставляем текущее изображение
          setFormData({
            ...formData,
            imageUrl: formData.imageUrl
          });
        }
      }

      // Затем отправляем данные о записи вместе с информацией о магазинах
      await api.put(`/api/recordings/${id}`, {
        ...formData,
        inventory: storeInventory
      });
      
      setSubmitting(false);
      
      // Перенаправление на страницу обновленной записи
      navigate(`/recordings/${id}`);
    } catch (err) {
      setError('Ошибка при обновлении записи. Пожалуйста, проверьте введенные данные.');
      setSubmitting(false);
      console.error('Ошибка при обновлении записи:', err);
    }
  };

  const mediaTypes = ['CD', 'Vinyl', 'Flash Drive', 'Cassette', 'Digital'];
  const genres = ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip Hop', 'Country', 'Folk', 'R&B', 'Blues', 'Other'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Получаем список доступных магазинов (которых еще нет в инвентаре)
  const availableStores = stores.filter(
    store => !storeInventory.some(item => item.storeId === store.id)
  );

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Редактирование записи</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
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
                    <p>Изображение:</p>
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

            {/* Секция для управления инвентарем магазинов */}
            <div className="card mt-4 mb-4">
              <div className="card-header bg-light">
                <h5 className="card-title mb-0">Наличие в магазинах</h5>
              </div>
              <div className="card-body">
                {storeInventory.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Магазин</th>
                          <th>Оптовая цена (₽)</th>
                          <th>Количество</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeInventory.map(item => (
                          <tr key={item.storeId}>
                            <td>{item.storeName}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="0"
                                step="0.01"
                                value={item.wholesalePrice}
                                onChange={(e) => handleInventoryChange(item.storeId, 'wholesalePrice', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="0"
                                value={item.inStock}
                                onChange={(e) => handleInventoryChange(item.storeId, 'inStock', e.target.value)}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveStore(item.storeId)}
                              >
                                <i className="bi bi-trash"></i> Удалить
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    Запись пока не добавлена ни в один магазин. Используйте кнопку ниже, чтобы добавить запись в магазин.
                  </div>
                )}

                {/* Кнопка для добавления магазина */}
                {availableStores.length > 0 ? (
                  <div className="mt-3">
                    <div className="d-flex align-items-center">
                      <select
                        className="form-select me-2"
                        id="storeSelect"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedStore = stores.find(s => s.id.toString() === e.target.value);
                            if (selectedStore) {
                              setStoreInventory([
                                ...storeInventory,
                                {
                                  storeId: selectedStore.id,
                                  storeName: selectedStore.name,
                                  wholesalePrice: Math.round(formData.retailPrice * 0.7), // 70% от розничной цены
                                  inStock: 0
                                }
                              ]);
                            }
                            e.target.value = ""; // Сбрасываем выбор
                          }
                        }}
                      >
                        <option value="">Выберите магазин...</option>
                        {availableStores.map(store => (
                          <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={handleAddStore}
                        disabled={availableStores.length === 0}
                      >
                        <i className="bi bi-plus-circle"></i> Добавить магазин
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning mt-3">
                    Все доступные магазины уже добавлены.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Сохранение...</span>
                  </>
                ) : (
                  'Сохранить изменения'
                )}
              </button>
              <Link to={`/recordings/${id}`} className="btn btn-outline-secondary ms-2">
                Отмена
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRecording;