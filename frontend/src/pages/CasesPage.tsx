import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/useToast';
import TrafficLight from '../components/TrafficLight';
import { ArrowLeft, Plus, FolderOpen, Eye } from 'lucide-react';

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
  const toast = useToast();
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
    try {
      await api.post('/cases', { policyId });
      toast('Trámite iniciado', 'success');
      loadCases();
    } catch { toast('Error al iniciar trámite', 'error'); }
  };

  const statusColor: Record<string, string> = {
    OPEN: '#1677ff',
    IN_PROGRESS: '#fa8c16',
    COMPLETED: '#52c41a',
    CANCELLED: '#ff4d4f',
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Cargando trámites...</span></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <Link to="/" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={13} /> Dashboard</Link>
          <h1 style={{ marginTop: 4 }}>Trámites: {policyName}</h1>
        </div>
        <button onClick={handleStartCase} className="btn btn-primary">
          <Plus size={16} /> Iniciar Trámite
        </button>
      </div>
      <div className="page-body fade-in">

      <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Estado</th>
            <th>Tareas</th>
            <th>Iniciado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.id.slice(0, 8)}...</td>
              <td style={{ display: 'flex', alignItems: 'center', gap: 6 }}><TrafficLight status={c.status} size={12} /><span className={`badge ${c.status === 'IN_PROGRESS' ? 'badge-orange' : c.status === 'COMPLETED' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span></td>
              <td>{c.tasks.filter((t) => t.status === 'DONE').length}/{c.tasks.length} completadas</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(c.startedAt).toLocaleString()}</td>
              <td><Link to={`/cases/${c.id}`} className="btn btn-ghost btn-sm"><Eye size={13} /> Ver detalle</Link></td>
            </tr>
          ))}
          {cases.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <FolderOpen size={32} color="var(--border)" />
                <span>No hay trámites aún</span>
                <button onClick={handleStartCase} className="btn btn-primary btn-sm" style={{ marginTop: 8 }}><Plus size={14} /> Iniciar primer trámite</button>
              </div>
            </td></tr>
          )}
        </tbody>
      </table>
      </div>
      </div>
    </>
  );
}
