import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';


const AdminReports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports/sales')
      .then(res => res.json())
      .then(data => {
        setSales(data.sales || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="container py-4">
      <h1>Статистика продаж</h1>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={sales.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalSales" fill="#8884d8" name="Продано" />
          <Bar dataKey="totalRevenue" fill="#82ca9d" name="Выручка" />
        </BarChart>
      </ResponsiveContainer>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Название</th>
            <th>Исполнитель</th>
            <th>Жанр</th>
            <th>Продано</th>
            <th>Выручка</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((item, idx) => (
            <tr key={item.recordingId}>
              <td>{idx + 1}</td>
              <td>{item.title}</td>
              <td>{item.artist}</td>
              <td>{item.genre}</td>
              <td>{item.totalSales}</td>
              <td>{Number(item.totalRevenue).toLocaleString()} ₽</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReports;