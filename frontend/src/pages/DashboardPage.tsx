import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

interface Policy {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface Stats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  pendingTasks: number;
}

export default function DashboardPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/policies').then((res) => setPolicies(res.data));
    api.get('/analytics/dashboard').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="page-body fade-in">
        {/* KPI Cards */}
        {stats && (
          <div className="kpi-grid" style={{ marginBottom: 24 }}>
            <div className="kpi-card blue">
              <div className="kpi-value" style={{ color: 'var(--primary)' }}>{stats.totalCases}</div>
              <div className="kpi-label">Total Trámites</div>
            </div>
            <div className="kpi-card orange">
              <div className="kpi-value" style={{ color: 'var(--warning)' }}>{stats.activeCases}</div>
              <div className="kpi-label">En Progreso</div>
            </div>
            <div className="kpi-card green">
              <div className="kpi-value" style={{ color: 'var(--success)' }}>{stats.completedCases}</div>
              <div className="kpi-label">Completados</div>
            </div>
            <div className="kpi-card red">
              <div className="kpi-value" style={{ color: 'var(--danger)' }}>{stats.pendingTasks}</div>
              <div className="kpi-label">Tareas Pendientes</div>
            </div>
          </div>
        )}

        {/* Policies Table */}
        <div className="card">
          <div className="card-body" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Políticas de Negocio</h2>
            <Link to="/policies/new" className="btn btn-primary btn-sm">+ Nueva Política</Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Creada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/policies/${p.id}/editor`} className="btn btn-ghost btn-sm">Editar</Link>
                      <Link to={`/policies/${p.id}/cases`} className="btn btn-warning btn-sm" style={{ color: '#fff' }}>Trámites</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No hay políticas creadas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
