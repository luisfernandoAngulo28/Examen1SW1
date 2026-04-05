import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import TrafficLight from '../components/TrafficLight';

interface Task {
  id: string;
  status: string;
  startedAt: string;
  node: { title: string; department?: { name: string } };
  case: { id: string; policy: { name: string } };
  assignedUser?: { name: string } | null;
}

export default function OfficerDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'mine' | 'pending'>('all');

  useEffect(() => {
    api.get('/cases/my-tasks').then((res) => setTasks(res.data));
  }, []);

  const filtered = tasks.filter((t) => {
    if (filter === 'mine') return t.assignedUser?.name === user?.name;
    if (filter === 'pending') return t.status === 'PENDING' && !t.assignedUser;
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <>
      <div className="page-header">
        <h1>👤 Mi Bandeja de Trabajo</h1>
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Bienvenido, <strong>{user?.name}</strong> — Funcionario
        </span>
      </div>
      <div className="page-body fade-in">
        {/* KPI Cards */}
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          <div className="kpi-card orange">
            <div className="kpi-value" style={{ color: 'var(--warning)' }}>{pendingCount}</div>
            <div className="kpi-label">Pendientes</div>
          </div>
          <div className="kpi-card blue">
            <div className="kpi-value" style={{ color: 'var(--primary)' }}>{inProgressCount}</div>
            <div className="kpi-label">En Progreso</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-value" style={{ color: 'var(--success)' }}>{doneCount}</div>
            <div className="kpi-label">Completadas</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{tasks.length}</div>
            <div className="kpi-label">Total Asignadas</div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setFilter('all')} className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}>
            Todas ({tasks.length})
          </button>
          <button onClick={() => setFilter('mine')} className={`btn btn-sm ${filter === 'mine' ? 'btn-primary' : 'btn-ghost'}`}>
            Mis tareas
          </button>
          <button onClick={() => setFilter('pending')} className={`btn btn-sm ${filter === 'pending' ? 'btn-warning' : 'btn-ghost'}`} style={filter === 'pending' ? { color: '#fff' } : {}}>
            Sin asignar
          </button>
        </div>

        {/* Tasks Table */}
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Actividad</th>
                <th>Departamento</th>
                <th>Política</th>
                <th>Asignado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td><TrafficLight status={t.status} /></td>
                  <td style={{ fontWeight: 600 }}>{t.node.title}</td>
                  <td>{t.node.department?.name || '—'}</td>
                  <td>{t.case.policy.name}</td>
                  <td>{t.assignedUser?.name || <span style={{ color: 'var(--warning)' }}>Sin asignar</span>}</td>
                  <td>
                    <Link to={`/cases/${t.case.id}`} className="btn btn-primary btn-sm">
                      {t.status === 'DONE' ? 'Ver' : 'Atender'}
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>No hay tareas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
