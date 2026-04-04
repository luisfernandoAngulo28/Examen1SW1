import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

interface Task {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  node: { id: string; title: string; department?: { name: string } };
  assignedUser: { id: string; name: string; email: string } | null;
}

interface Case {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  policy: { id: string; name: string };
  tasks: Task[];
}

export default function CasesPage() {
  const { policyId } = useParams<{ policyId: string }>();
  const [cases, setCases] = useState<Case[]>([]);
  const [policyName, setPolicyName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCases = () => {
    api.get(`/cases?policyId=${policyId}`).then((res) => {
      setCases(res.data);
      if (res.data.length > 0) setPolicyName(res.data[0].policy.name);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!policyName) {
      api.get(`/policies/${policyId}`).then((res) => setPolicyName(res.data.name)).catch(() => {});
    }
    loadCases();
  }, [policyId]);

  const handleStartCase = async () => {
    await api.post('/cases', { policyId });
    loadCases();
  };

  const statusColor: Record<string, string> = {
    OPEN: '#1677ff',
    IN_PROGRESS: '#fa8c16',
    COMPLETED: '#52c41a',
    CANCELLED: '#ff4d4f',
  };

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Link to="/" style={{ color: '#1677ff', textDecoration: 'none' }}>&larr; Dashboard</Link>
          <h1 style={{ margin: '8px 0' }}>Trámites: {policyName}</h1>
        </div>
        <button
          onClick={handleStartCase}
          style={{ padding: '10px 20px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 15 }}
        >
          + Iniciar Trámite
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>ID</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Estado</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Tareas</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Iniciado</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: 12, borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: 13 }}>
                {c.id.slice(0, 8)}...
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                <span style={{ color: statusColor[c.status] || '#333', fontWeight: 600 }}>{c.status}</span>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                {c.tasks.filter((t) => t.status === 'DONE').length}/{c.tasks.length} completadas
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                {new Date(c.startedAt).toLocaleString()}
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                <Link to={`/cases/${c.id}`} style={{ color: '#1677ff' }}>Ver detalle</Link>
              </td>
            </tr>
          ))}
          {cases.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No hay trámites. Inicia uno con el botón de arriba.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
