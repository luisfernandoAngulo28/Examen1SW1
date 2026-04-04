import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

interface Dept {
  id: string;
  name: string;
  users: { id: string; name: string }[];
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [newName, setNewName] = useState('');

  const load = () => api.get('/departments').then((res) => setDepartments(res.data));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await api.post('/departments', { name: newName });
    setNewName('');
    load();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/departments/${id}`);
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <Link to="/" style={{ color: '#1677ff', marginBottom: 16, display: 'inline-block' }}>← Volver al dashboard</Link>
      <h1>Departamentos</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del departamento"
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', flex: 1 }}
        />
        <button onClick={handleCreate} style={{ padding: '8px 16px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Crear
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Nombre</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Funcionarios</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{d.name}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{d.users.map((u) => u.name).join(', ') || '-'}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                <button onClick={() => handleDelete(d.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
