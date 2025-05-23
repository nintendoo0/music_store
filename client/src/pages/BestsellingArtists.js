import React, { useEffect, useState } from 'react';

const BestsellingArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/artists/bestselling')
      .then(res => res.json())
      .then(data => {
        setArtists(data.artists || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="container py-4">
      <h1>Топ исполнителей по продажам</h1>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Исполнитель</th>
            <th>Всего продаж</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((item, idx) => (
            <tr key={item.artist}>
              <td>{idx + 1}</td>
              <td>{item.artist}</td>
              <td>{item.totalSales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BestsellingArtists;