import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';

interface Dept {
  id: string;
  name: string;
  users: { id: string; name: string }[];
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  const load = () => api.get('/departments').then((res) => setDepartments(res.data));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await api.post('/departments', { name: newName });
      toast('Departamento creado', 'success');
      setNewName('');
      load();
    } catch { toast('Error al crear departamento', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/departments/${id}`);
      toast('Departamento eliminado', 'info');
      load();
    } catch { toast('Error al eliminar', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <h1>🏢 Departamentos</h1>
      </div>
      <div className="page-body fade-in">

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del departamento"
          className="form-input"
          style={{ flex: 1 }}
        />
        <button onClick={handleCreate} className="btn btn-primary">
          Crear
        </button>
      </div>

      <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Funcionarios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td style={{ fontWeight: 600 }}>{d.name}</td>
              <td>{d.users.map((u) => u.name).join(', ') || <span style={{ color: 'var(--text-secondary)' }}>—</span>}</td>
              <td>
                <button onClick={() => handleDelete(d.id)} className="btn btn-danger btn-sm">Eliminar</button>
              </td>
            </tr>
          ))}
          {departments.length === 0 && (
            <tr><td colSpan={3} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No hay departamentos creados.</td></tr>
          )}
        </tbody>
      </table>
      </div>
      </div>
    </>
  );
}
