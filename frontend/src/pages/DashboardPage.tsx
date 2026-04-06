import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import { LayoutDashboard, Plus, Pencil, FolderOpen, FileText, Activity, CheckCircle2, Clock } from 'lucide-react';

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
        <h1><LayoutDashboard size={22} />Dashboard</h1>
      </div>
      <div className="page-body fade-in">
        {/* KPI Cards */}
        {stats && (
          <div className="kpi-grid" style={{ marginBottom: 28 }}>
            <div className="kpi-card blue">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="kpi-value" style={{ color: 'var(--primary)' }}>{stats.totalCases}</div>
                  <div className="kpi-label">Total Trámites</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="var(--primary)" />
                </div>
              </div>
            </div>
            <div className="kpi-card orange">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="kpi-value" style={{ color: 'var(--warning)' }}>{stats.activeCases}</div>
                  <div className="kpi-label">En Progreso</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={20} color="var(--warning)" />
                </div>
              </div>
            </div>
            <div className="kpi-card green">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="kpi-value" style={{ color: 'var(--success)' }}>{stats.completedCases}</div>
                  <div className="kpi-label">Completados</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} color="var(--success)" />
                </div>
              </div>
            </div>
            <div className="kpi-card red">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="kpi-value" style={{ color: 'var(--danger)' }}>{stats.pendingTasks}</div>
                  <div className="kpi-label">Tareas Pendientes</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color="var(--danger)" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Policies Table */}
        <div className="card">
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderOpen size={18} color="var(--text-secondary)" />
              Políticas de Negocio
            </h2>
            <Link to="/policies/new" className="btn btn-primary btn-sm"><Plus size={14} /> Nueva Política</Link>
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
                      <Link to={`/policies/${p.id}/editor`} className="btn btn-ghost btn-sm"><Pencil size={13} /> Editar</Link>
                      <Link to={`/policies/${p.id}/cases`} className="btn btn-warning btn-sm" style={{ color: '#fff' }}><FolderOpen size={13} /> Trámites</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FolderOpen size={32} color="var(--border)" />
                    <span>No hay políticas creadas aún</span>
                    <Link to="/policies/new" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}><Plus size={14} /> Crear primera política</Link>
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
