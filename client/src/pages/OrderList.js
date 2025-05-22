import React, { useEffect, useState } from 'react';
import api from '../services/api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/my-orders').then(res => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container py-4">Загрузка...</div>;

  return (
    <div className="container py-4">
      <h1>Мои заказы</h1>
      {orders.length === 0 ? (
        <div>У вас пока нет заказов.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>№ заказа</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>{order.totalAmount} ₽</td>
                <td>
                  <ul>
                    {(order.OrderItems || []).map(item => (
                      <li key={item.id}>
                        {item.Recording.title} — {item.quantity} шт.
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList;