import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Department {
  id: string;
  name: string;
}

interface Task {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  node: { id: string; title: string; department: Department };
  assignedUser: { id: string; name: string; email: string } | null;
  formSubmission: any;
}

interface EventLog {
  id: string;
  type: string;
  payloadJson: any;
  createdAt: string;
}

interface CaseDetail {
  id: string;
  status: string;
  currentNodeId: string | null;
  startedAt: string;
  finishedAt: string | null;
  policy: { id: string; name: string };
  tasks: Task[];
  eventLogs: EventLog[];
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);

  const load = () => {
    api.get(`/cases/${id}`).then((res) => setCaseData(res.data));
  };

  useEffect(() => {
    load();
    // Load officers for assignment
    api.get('/auth/users').then((res) => setUsers(res.data)).catch(() => {});
  }, [id]);

  const handleComplete = async (taskId: string) => {
    await api.post(`/cases/tasks/${taskId}/complete`);
    load();
  };

  const handleAssign = async (taskId: string, userId: string) => {
    await api.patch(`/cases/tasks/${taskId}/assign`, { userId });
    load();
  };

  const handleCancel = async () => {
    if (!confirm('¿Cancelar este trámite?')) return;
    await api.patch(`/cases/${id}/cancel`);
    load();
  };

  if (!caseData) return <div style={{ padding: 24 }}>Cargando...</div>;

  const statusColor: Record<string, string> = {
    PENDING: '#999',
    IN_PROGRESS: '#fa8c16',
    DONE: '#52c41a',
    BLOCKED: '#ff4d4f',
  };

  const caseStatusColor: Record<string, string> = {
    OPEN: '#1677ff',
    IN_PROGRESS: '#fa8c16',
    COMPLETED: '#52c41a',
    CANCELLED: '#ff4d4f',
  };

  return (
    <>
      <div className="page-header">
        <div>
          <Link to={`/policies/${caseData.policy.id}/cases`} style={{ fontSize: 13 }}>&larr; Volver a trámites</Link>
          <h1 style={{ marginTop: 4 }}>Trámite: {caseData.policy.name}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: 13 }}>
            ID: <code>{caseData.id}</code> · Iniciado: {new Date(caseData.startedAt).toLocaleString()}
            {caseData.finishedAt && <> · Finalizado: {new Date(caseData.finishedAt).toLocaleString()}</>}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${caseData.status === 'IN_PROGRESS' ? 'badge-orange' : caseData.status === 'COMPLETED' ? 'badge-green' : caseData.status === 'CANCELLED' ? 'badge-red' : 'badge-blue'}`} style={{ fontSize: 14, padding: '6px 14px' }}>
            {caseData.status}
          </span>
          {caseData.status !== 'COMPLETED' && caseData.status !== 'CANCELLED' && (
            <button onClick={handleCancel} className="btn btn-danger">
              Cancelar trámite
            </button>
          )}
        </div>
      </div>
      <div className="page-body fade-in">

      {/* Tasks */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Tareas del flujo</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {caseData.tasks.map((task) => (
          <div key={task.id} className="task-card" style={{ borderLeftColor: statusColor[task.status] }}>
            <div className="task-card-header">
              <div>
                <strong style={{ fontSize: 15 }}>{task.node.title}</strong>
                <span style={{ marginLeft: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                  [{task.node.department?.name || 'Sin depto'}]
                </span>
              </div>
              <span className={`badge ${task.status === 'DONE' ? 'badge-green' : task.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'}`}>{task.status}</span>
            </div>

            <div className="task-card-actions">
              {/* Assign */}
              {task.status !== 'DONE' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Asignar a:</label>
                  <select
                    value={task.assignedUser?.id || ''}
                    onChange={(e) => handleAssign(task.id, e.target.value)}
                    className="form-input"
                    style={{ width: 'auto', padding: '4px 8px' }}
                  >
                    <option value="">Sin asignar</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Complete button */}
              {task.status !== 'DONE' && (
                <button onClick={() => handleComplete(task.id)} className="btn btn-success btn-sm">
                  Completar
                </button>
              )}

              {task.assignedUser && (
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Asignado a: <strong>{task.assignedUser.name}</strong>
                </span>
              )}

              {task.finishedAt && (
                <span style={{ fontSize: 13, color: 'var(--success)' }}>
                  Completada: {new Date(task.finishedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Event Log */}
      <h2 style={{ marginTop: 32, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Historial de eventos</h2>
      <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Datos</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          {caseData.eventLogs.map((log) => (
            <tr key={log.id}>
              <td><span className="badge badge-blue">{log.type}</span></td>
              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                {log.payloadJson ? JSON.stringify(log.payloadJson) : '—'}
              </td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
    </>
  );
}
