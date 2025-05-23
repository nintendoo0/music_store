import React, { useState } from 'react';

const GroupCreate = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });
    if (res.ok) {
      setMessage('Группа успешно создана!');
      setName('');
      setDescription('');
    } else {
      setMessage('Ошибка при создании группы');
    }
  };

  return (
    <div className="container py-4">
      <h2>Создать новую группу</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Название группы</label>
          <input
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Описание</label>
          <textarea
            className="form-control"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit">Создать группу</button>
      </form>
      {message && <div className="mt-3">{message}</div>}
    </div>
  );
};

export default GroupCreate;