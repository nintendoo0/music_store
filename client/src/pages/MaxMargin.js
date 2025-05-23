import React, { useEffect, useState } from 'react';

const MaxMargin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/analysis/max-margin', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (!data || !data.maxMargin) return <div>Нет данных для анализа.</div>;

  const { maxMargin, avgMargin } = data;

  return (
    <div className="container py-4">
      <h1>Запись с максимальной маржой</h1>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{maxMargin.title} — {maxMargin.artist}</h5>
          <p className="card-text">
            Жанр: <b>{maxMargin.genre}</b><br />
            Розничная цена: <b>{maxMargin.retailPrice} ₽</b><br />
            Оптовая цена: <b>{maxMargin.wholesalePrice} ₽</b><br />
            <span style={{color: 'green'}}>Максимальная маржа: <b>{maxMargin.margin} ₽</b></span>
          </p>
          <p>
            Магазин: <b>{maxMargin.storeName}</b>
          </p>
        </div>
      </div>
      <div>
        <b>Средняя маржа по всем записям:</b> {Number(avgMargin).toFixed(2)} ₽
      </div>
      <div className="mt-3 text-muted">
        Анализ маржи помогает выявить наиболее прибыльные позиции и оптимизировать ценообразование для увеличения дохода магазина.
      </div>
    </div>
  );
};

export default MaxMargin;