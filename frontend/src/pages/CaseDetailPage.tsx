import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import DynamicForm from '../components/DynamicForm';
import { useToast } from '../components/Toast';
import TrafficLight from '../components/TrafficLight';

interface Department {
  id: string;
  name: string;
}

interface Task {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  node: { id: string; title: string; nodeType?: string; department: Department };
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
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [formTemplates, setFormTemplates] = useState<Record<string, any>>({});
  const [formSubmissions, setFormSubmissions] = useState<Record<string, any>>({});
  const [submittingForm, setSubmittingForm] = useState<string | null>(null);
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [decisionEdges, setDecisionEdges] = useState<Record<string, { conditionLabel: string; toNodeId: string }[]>>({});

  const load = () => {
    api.get(`/cases/${id}`).then((res) => {
      setCaseData(res.data);
      // Load form templates and submissions for each task
      res.data.tasks.forEach((task: Task) => {
        api.get(`/forms/template/${task.node.id}`).then((r) => {
          if (r.data) setFormTemplates((prev) => ({ ...prev, [task.node.id]: r.data.schemaJson }));
        }).catch(() => {});
        api.get(`/forms/submission/${task.id}`).then((r) => {
          if (r.data) setFormSubmissions((prev) => ({ ...prev, [task.id]: r.data.payloadJson }));
        }).catch(() => {});
      });
      // Load decision edges for DECISION nodes
      if (res.data.policy?.id) {
        api.get(`/policies/${res.data.policy.id}`).then((pRes) => {
          const edges = pRes.data.edges || [];
          const decNodes = (res.data.tasks as Task[]).filter((t) => t.node.nodeType === 'DECISION' && t.status !== 'DONE');
          const map: Record<string, { conditionLabel: string; toNodeId: string }[]> = {};
          decNodes.forEach((t) => {
            const nodeEdges = edges.filter((e: any) => e.fromNodeId === t.node.id && e.conditionLabel);
            if (nodeEdges.length > 0) {
              map[t.id] = nodeEdges.map((e: any) => ({ conditionLabel: e.conditionLabel, toNodeId: e.toNodeId }));
            }
          });
          setDecisionEdges(map);
        }).catch(() => {});
      }
    });
  };

  useEffect(() => {
    load();
    api.get('/auth/users').then((res) => setUsers(res.data)).catch(() => {});
  }, [id]);

  const handleComplete = async (taskId: string, chosenEdgeLabel?: string) => {
    try {
      await api.post(`/cases/tasks/${taskId}/complete`, { chosenEdgeLabel });
      toast('Tarea completada', 'success');
      load();
    } catch { toast('Error al completar tarea', 'error'); }
  };

  const handleAssign = async (taskId: string, userId: string) => {
    try {
      await api.patch(`/cases/tasks/${taskId}/assign`, { userId });
      toast('Funcionario asignado', 'success');
      load();
    } catch { toast('Error al asignar', 'error'); }
  };

  const handleCancel = async () => {
    if (!confirm('¿Cancelar este trámite?')) return;
    try {
      await api.patch(`/cases/${id}/cancel`);
      toast('Trámite cancelado', 'info');
      load();
    } catch { toast('Error al cancelar', 'error'); }
  };

  const handleFormSubmit = async (taskId: string, data: Record<string, any>, inputMode: string = 'MANUAL') => {
    setSubmittingForm(taskId);
    try {
      await api.post(`/forms/submit/${taskId}`, { payloadJson: data, inputMode });
      setFormSubmissions((prev) => ({ ...prev, [taskId]: data }));
      toast('Formulario guardado', 'success');
    } catch (err) {
      toast('Error al guardar formulario', 'error');
    }
    setSubmittingForm(null);
  };

  const toggleForm = (taskId: string) => {
    setExpandedForms((prev) => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  };

  if (!caseData) return <div className="loading-page"><div className="spinner" /><span>Cargando trámite...</span></div>;

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
          <TrafficLight status={caseData.status} size={18} showLabel />
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
        {caseData.tasks
          .filter((task) => !['INITIAL', 'FORK', 'JOIN', 'FINAL'].includes(task.node.nodeType || 'ACTION'))
          .map((task) => (
          <div key={task.id} className="task-card" style={{ borderLeftColor: statusColor[task.status] }}>
            <div className="task-card-header">
              <div>
                <strong style={{ fontSize: 15 }}>{task.node.title}</strong>
                <span style={{ marginLeft: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                  [{task.node.department?.name || 'Sin depto'}]
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrafficLight status={task.status} size={12} />
                <span className={`badge ${task.status === 'DONE' ? 'badge-green' : task.status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'}`}>{task.status}</span>
              </div>
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

              {/* Complete button — with decision paths if applicable */}
              {task.status !== 'DONE' && (
                decisionEdges[task.id] && decisionEdges[task.id].length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>◇ Decidir:</span>
                    {decisionEdges[task.id].map((de) => (
                      <button
                        key={de.conditionLabel}
                        onClick={() => handleComplete(task.id, de.conditionLabel)}
                        className="btn btn-warning btn-sm"
                        style={{ color: '#fff' }}
                      >
                        {de.conditionLabel}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => handleComplete(task.id)} className="btn btn-success btn-sm">
                    Completar
                  </button>
                )
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

            {/* Dynamic Form */}
            {formTemplates[task.node.id] && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleForm(task.id)}
                  style={{ marginBottom: 8 }}
                >
                  {expandedForms.has(task.id) ? '▾' : '▸'} Formulario
                  {formSubmissions[task.id] && <span className="badge badge-green" style={{ marginLeft: 8 }}>Completado</span>}
                </button>
                {expandedForms.has(task.id) && (
                  <DynamicForm
                    schema={formTemplates[task.node.id]}
                    initialData={formSubmissions[task.id] || null}
                    readOnly={task.status === 'DONE' || !!formSubmissions[task.id]}
                    onSubmit={!formSubmissions[task.id] && task.status !== 'DONE' ? (data, inputMode) => handleFormSubmit(task.id, data, inputMode) : undefined}
                    submitting={submittingForm === task.id}
                  />
                )}
              </div>
            )}
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
