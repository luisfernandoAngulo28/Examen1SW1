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
    <div style={{ padding: 24 }}>
      <Link to={`/policies/${caseData.policy.id}/cases`} style={{ color: '#1677ff', textDecoration: 'none' }}>&larr; Volver a trámites</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <h1 style={{ margin: '8px 0' }}>Trámite: {caseData.policy.name}</h1>
        <div>
          <span style={{ color: caseStatusColor[caseData.status], fontWeight: 700, fontSize: 18, marginRight: 16 }}>
            {caseData.status}
          </span>
          {caseData.status !== 'COMPLETED' && caseData.status !== 'CANCELLED' && (
            <button onClick={handleCancel} style={{ padding: '6px 16px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Cancelar trámite
            </button>
          )}
        </div>
      </div>
      <p style={{ color: '#666', margin: '4px 0 24px' }}>
        ID: <code>{caseData.id}</code> &middot; Iniciado: {new Date(caseData.startedAt).toLocaleString()}
        {caseData.finishedAt && <> &middot; Finalizado: {new Date(caseData.finishedAt).toLocaleString()}</>}
      </p>

      {/* Tasks */}
      <h2>Tareas del flujo</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {caseData.tasks.map((task) => (
          <div key={task.id} style={{
            background: '#fff',
            border: '1px solid #eee',
            borderLeft: `4px solid ${statusColor[task.status]}`,
            borderRadius: 6,
            padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 16 }}>{task.node.title}</strong>
                <span style={{ marginLeft: 12, color: '#888', fontSize: 13 }}>
                  [{task.node.department?.name || 'Sin depto'}]
                </span>
              </div>
              <span style={{ color: statusColor[task.status], fontWeight: 600 }}>{task.status}</span>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Assign */}
              {task.status !== 'DONE' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontSize: 13, color: '#666' }}>Asignar a:</label>
                  <select
                    value={task.assignedUser?.id || ''}
                    onChange={(e) => handleAssign(task.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
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
                <button
                  onClick={() => handleComplete(task.id)}
                  style={{ padding: '6px 16px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                  Completar
                </button>
              )}

              {task.assignedUser && (
                <span style={{ fontSize: 13, color: '#666' }}>
                  Asignado a: <strong>{task.assignedUser.name}</strong>
                </span>
              )}

              {task.finishedAt && (
                <span style={{ fontSize: 13, color: '#52c41a' }}>
                  Completada: {new Date(task.finishedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Event Log */}
      <h2 style={{ marginTop: 32 }}>Historial de eventos</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Evento</th>
            <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Datos</th>
            <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Hora</th>
          </tr>
        </thead>
        <tbody>
          {caseData.eventLogs.map((log) => (
            <tr key={log.id}>
              <td style={{ padding: 10, borderBottom: '1px solid #eee', fontWeight: 600 }}>{log.type}</td>
              <td style={{ padding: 10, borderBottom: '1px solid #eee', fontFamily: 'monospace', fontSize: 12 }}>
                {log.payloadJson ? JSON.stringify(log.payloadJson) : '—'}
              </td>
              <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
