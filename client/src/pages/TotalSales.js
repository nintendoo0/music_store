import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const TotalSales = () => {
  const { id } = useParams();
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const response = await api.get(`/api/stores/${id}/total-sales`);
        setSalesData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных о продажах.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchTotalSales();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!salesData) {
    return <div className="alert alert-warning">Данные о продажах не найдены</div>;
  }

  // Форматирование валюты
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
  };

  return (
    <div>
      <h1 className="mb-4">Отчет о продажах</h1>
      <h2 className="h4 mb-4">{salesData.storeName}</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-light h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Общие продажи (розница)</h5>
              <p className="display-6 text-primary">{formatCurrency(salesData.totalRetailSales)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Общие затраты (опт)</h5>
              <p className="display-6 text-secondary">{formatCurrency(salesData.totalWholesaleSales)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-light h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Общая прибыль</h5>
              <p className="display-6 text-success">{formatCurrency(salesData.totalProfit)}</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mb-3">Детали продаж по записям</h3>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Название</th>
              <th>Исполнитель</th>
              <th>Продано (шт.)</th>
              <th>Розничная цена</th>
              <th>Оптовая цена</th>
              <th>Розничная выручка</th>
              <th>Оптовые затраты</th>
              <th>Прибыль</th>
            </tr>
          </thead>
          <tbody>
            {salesData.salesDetails.map(item => (
              <tr key={item.recordingId}>
                <td>
                  <Link to={`/recordings/${item.recordingId}`}>{item.title}</Link>
                </td>
                <td>{item.artist}</td>
                <td>{item.salesCount}</td>
                <td>{formatCurrency(item.retailPrice)}</td>
                <td>{formatCurrency(item.wholesalePrice)}</td>
                <td>{formatCurrency(item.retailSales)}</td>
                <td>{formatCurrency(item.wholesaleSales)}</td>
                <td className={item.profit > 0 ? 'text-success' : 'text-danger'}>
                  {formatCurrency(item.profit)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-light fw-bold">
            <tr>
              <td colSpan="5">Итого:</td>
              <td>{formatCurrency(salesData.totalRetailSales)}</td>
              <td>{formatCurrency(salesData.totalWholesaleSales)}</td>
              <td className={salesData.totalProfit > 0 ? 'text-success' : 'text-danger'}>
                {formatCurrency(salesData.totalProfit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4">
        <Link to={`/stores/${id}`} className="btn btn-secondary me-2">
          Назад к магазину
        </Link>
        <Link to={`/stores/${id}/out-of-stock`} className="btn btn-outline-primary">
          Отсутствующие записи
        </Link>
      </div>
    </div>
  );
};

export default TotalSales;