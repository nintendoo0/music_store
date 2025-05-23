import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GroupEdit = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [allRecordings, setAllRecordings] = useState([]);
  const [groupRecordings, setGroupRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch('/api/recordings', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`/api/groups/${groupId}/recordings`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ]).then(([groupData, allRecData, groupRecData]) => {
      setGroup(groupData.group);
      setAllRecordings(allRecData.recordings || []);
      setGroupRecordings(groupRecData.recordings || []);
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [groupId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedRecording) return;
    await fetch(`/api/groups/${groupId}/recordings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ recordingId: selectedRecording })
    });
    const res = await fetch(`/api/groups/${groupId}/recordings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setGroupRecordings(data.recordings || []);
  };

  const handleDelete = async (recordingId) => {
    await fetch(`/api/groups/${groupId}/recordings/${recordingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setGroupRecordings(groupRecordings.filter(r => r.id !== recordingId));
  };

  if (loading) return <div>Загрузка...</div>;
  if (!group) return <div>Группа не найдена</div>;

  const availableRecordings = allRecordings.filter(
    r => !groupRecordings.some(gr => gr.id === r.id)
  );

  return (
    <div className="container py-4">
      <h2>Редактирование группы: {group.name}</h2>
      <p>{group.description}</p>

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
    </div>
  );
};

export default GroupEdit;