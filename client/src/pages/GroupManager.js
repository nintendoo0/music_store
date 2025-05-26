import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const GroupManager = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupRecordings, setGroupRecordings] = useState([]);
  const [allRecordings, setAllRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState('');
  const token = localStorage.getItem('token');

  // Загрузка групп и всех песен
  useEffect(() => {
    fetch('/api/groups', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setGroups(data || []));
    fetch('/api/recordings', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAllRecordings(data.recordings || []));
  }, [token]);

  // Загрузка песен выбранной группы
  useEffect(() => {
    if (!selectedGroup) {
      setGroupRecordings([]);
      return;
    }
    fetch(`/api/groups/${selectedGroup}/recordings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setGroupRecordings(data.recordings || []));
  }, [selectedGroup, token]);

  // Добавить песню в группу
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedRecording || !selectedGroup) return;
    await fetch(`/api/groups/${selectedGroup}/recordings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ recordingId: selectedRecording })
    });
    // Обновить список песен в группе
    fetch(`/api/groups/${selectedGroup}/recordings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setGroupRecordings(data.recordings || []));
  };

  // Удалить песню из группы
  const handleDelete = async (recordingId) => {
    await fetch(`/api/groups/${selectedGroup}/recordings/${recordingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setGroupRecordings(groupRecordings.filter(r => r.id !== recordingId));
  };

  // Песни, которых ещё нет в группе
  const availableRecordings = allRecordings.filter(
    r => !groupRecordings.some(gr => gr.id === r.id)
  );

  return (
    <div className="container py-4">
      <div className="mb-3 d-flex justify-content-end">
        <Link to="/groups/create" className="btn btn-success">
          Создать группу
        </Link>
      </div>
      <h2>Управление группами песен</h2>
      <div className="mb-3">
        <label>Выберите группу:</label>
        <select
          className="form-select"
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
        >
          <option value="">-- Не выбрано --</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      {selectedGroup && (
        <>
          <h4>Песни в группе:</h4>
          <ul className="list-group mb-3">
            {groupRecordings.map(rec => (
              <li key={rec.id} className="list-group-item d-flex justify-content-between align-items-center">
                {rec.title} — {rec.artist}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rec.id)}>
                  Удалить
                </button>
              </li>
            ))}
            {groupRecordings.length === 0 && <li className="list-group-item">Нет песен в группе</li>}
          </ul>

          <form className="mb-3" onSubmit={handleAdd}>
            <div className="input-group">
              <select
                className="form-select"
                value={selectedRecording}
                onChange={e => setSelectedRecording(e.target.value)}
              >
                <option value="">Выберите песню для добавления</option>
                {availableRecordings.map(rec => (
                  <option key={rec.id} value={rec.id}>
                    {rec.title} — {rec.artist}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" type="submit" disabled={!selectedRecording}>
                Добавить в группу
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default GroupManager;