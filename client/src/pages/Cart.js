import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [stockInfo, setStockInfo] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/stores').then(res => setStores(res.data));
  }, []);

  // Загружаем остатки при выборе магазина
  useEffect(() => {
    const fetchStock = async () => {
      if (!selectedStore) {
        setStockInfo({});
        return;
      }
      try {
        const res = await api.post('/api/store-inventory', {
          storeId: selectedStore,
          recordingIds: cart.map(item => item.recordingId)
        });
        // res.data = [{recordingId, inStock}, ...]
        const info = {};
        res.data.forEach(item => {
          info[item.recordingId] = item.inStock;
        });
        setStockInfo(info);
      } catch {
        setStockInfo({});
      }
    };
    fetchStock();
  }, [selectedStore, cart]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async () => {
    setError('');
    // Проверка остатков
    for (const item of cart) {
      if (
        typeof stockInfo[item.recordingId] === 'number' &&
        item.quantity > stockInfo[item.recordingId]
      ) {
        setError(
          `Недостаточно товара "${item.title}" в выбранном магазине (в наличии: ${stockInfo[item.recordingId]})`
        );
        return;
      }
    }
    if (!selectedStore) {
      setError('Пожалуйста, выберите магазин для оформления заказа');
      return;
    }
    try {
      await api.post('/api/orders', {
        storeId: selectedStore,
        items: cart.map(item => ({
          recordingId: item.recordingId,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      });
      clearCart();
      alert('Заказ успешно оформлен!');
      navigate('/orders');
    } catch (err) {
      setError('Ошибка при оформлении заказа');
    }
  };

  if (cart.length === 0) return <div className="container py-4"><h2>Корзина пуста</h2></div>;

  return (
    <div className="container py-4">
      <h1>Корзина</h1>
      {/* Выбор магазина */}
      <div className="mb-3">
        <label className="form-label">Выберите магазин для покупки:</label>
        <select
          className="form-select"
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
        >
          <option value="">-- Выберите магазин --</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>{store.name}</option>
          ))}
        </select>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Исполнитель</th>
            <th>Цена</th>
            <th>Кол-во</th>
            <th>В наличии</th>
            <th>Сумма</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.recordingId}>
              <td>{item.title}</td>
              <td>{item.artist}</td>
              <td>{item.price} ₽</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => updateQuantity(item.recordingId, Number(e.target.value))}
                  style={{ width: 60 }}
                  disabled={
                    typeof stockInfo[item.recordingId] === 'number' &&
                    item.quantity > stockInfo[item.recordingId]
                  }
                />
              </td>
              <td>
                {typeof stockInfo[item.recordingId] === 'number'
                  ? stockInfo[item.recordingId]
                  : '-'}
              </td>
              <td>{item.price * item.quantity} ₽</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.recordingId)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>Итого: {total} ₽</h4>
      <button className="btn btn-primary" onClick={handleOrder}>Оформить заказ</button>
      <button className="btn btn-secondary ms-2" onClick={clearCart}>Очистить корзину</button>
    </div>
  );
};

export default Cart;