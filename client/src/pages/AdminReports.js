import React, { useEffect, useState } from 'react';

const AdminReports = () => {
  const [sales, setSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = () => {
    setLoading(true);
    let url = `/api/admin/reports/sales?`;
    if (dateFrom) url += `dateFrom=${dateFrom}&`;
    if (dateTo) url += `dateTo=${dateTo}&`;

    const token = localStorage.getItem('token');
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSales(data.sales || []);
        setTotalRevenue(data.totalRevenue || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="container py-4">
      <h1>Статистика продаж</h1>
      <form className="mb-3" onSubmit={handleFilter}>
        <label>
          С:  
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </label>
        <label className="ms-4">
          По:  
          
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary ms-3">Показать</button>
      </form>
      <div className="mb-3">
        <strong>Общая выручка за период: </strong>
        {Number(totalRevenue).toLocaleString()} ₽
      </div>
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