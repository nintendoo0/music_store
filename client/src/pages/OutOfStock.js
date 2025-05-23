import React, { useEffect, useState } from 'react';

const OutOfStock = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token'); // или где у вас хранится токен
    fetch('/api/out-of-stock', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setItems(data.outOfStock || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="container py-4">
      <h1>Отсутствующие записи в магазинах</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Магазин</th>
            <th>Название</th>
            <th>Исполнитель</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.storeId}-${item.recordingId}`}>
              <td>{item.storeName}</td>
              <td>{item.title}</td>
              <td>{item.artist}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OutOfStock;