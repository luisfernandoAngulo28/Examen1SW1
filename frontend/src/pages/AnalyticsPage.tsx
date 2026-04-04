import { useEffect, useState } from 'react';
import api from '../api';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  cancelledCases: number;
  totalTasks: number;
  pendingTasks: number;
  tasksPerDepartment: { name: string; count: number }[];
}

interface NodeStat {
  nodeId: string;
  nodeTitle: string;
  departmentName: string;
  avgDurationMinutes: number;
  totalTasks: number;
  pendingTasks: number;
  isBottleneck: boolean;
}

interface PolicyAnalytics {
  policyId: string;
  policyName: string;
  totalCases: number;
  completedCases: number;
  avgCaseDurationMinutes: number;
  nodeStats: NodeStat[];
  bottlenecks: NodeStat[];
}

interface Policy {
  id: string;
  name: string;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [policyAnalytics, setPolicyAnalytics] = useState<PolicyAnalytics | null>(null);

  useEffect(() => {
    api.get('/analytics/dashboard').then((res) => setStats(res.data));
    api.get('/policies').then((res) => setPolicies(res.data));
  }, []);

  const loadPolicyAnalytics = (policyId: string) => {
    setSelectedPolicy(policyId);
    if (policyId) {
      api.get(`/analytics/policy/${policyId}`).then((res) => setPolicyAnalytics(res.data));
    } else {
      setPolicyAnalytics(null);
    }
  };

  if (!stats) return <div className="loading-page"><div className="spinner" /><span>Cargando analytics...</span></div>;

  return (
    <>
      <div className="page-header">
        <h1>📊 Analytics & Cuellos de Botella</h1>
      </div>
      <div className="page-body fade-in">

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--primary)' }}>{stats.totalCases}</div><div className="kpi-label">Total Trámites</div></div>
        <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--warning)' }}>{stats.activeCases}</div><div className="kpi-label">Activos</div></div>
        <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--success)' }}>{stats.completedCases}</div><div className="kpi-label">Completados</div></div>
        <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--danger)' }}>{stats.pendingTasks}</div><div className="kpi-label">Tareas Pendientes</div></div>
      </div>

      {/* Tasks per department */}
      {stats.tasksPerDepartment.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Tareas pendientes por departamento</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stats.tasksPerDepartment.map((d) => (
              <div key={d.name} className="kpi-card" style={{ minWidth: 150, padding: '12px 20px' }}>
                <div className="kpi-value" style={{ fontSize: 24, color: d.count >= 3 ? 'var(--danger)' : 'var(--text-primary)' }}>{d.count}</div>
                <div className="kpi-label">{d.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-policy analysis */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Análisis por Política</h2>
      <select
        value={selectedPolicy}
        onChange={(e) => loadPolicyAnalytics(e.target.value)}
        className="form-input"
        style={{ maxWidth: 400, marginBottom: 16 }}
      >
        <option value="">Seleccionar política...</option>
        {policies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {policyAnalytics && (
        <div>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
            <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--primary)' }}>{policyAnalytics.totalCases}</div><div className="kpi-label">Trámites</div></div>
            <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--success)' }}>{policyAnalytics.completedCases}</div><div className="kpi-label">Completados</div></div>
            <div className="kpi-card"><div className="kpi-value" style={{ color: '#722ed1' }}>{policyAnalytics.avgCaseDurationMinutes}</div><div className="kpi-label">Duración Prom. (min)</div></div>
          </div>

          {/* Bottleneck alert */}
          {policyAnalytics.bottlenecks.length > 0 && (
            <div className="card" style={{ background: '#fff2e8', border: '1px solid #ffbb96', padding: 16, marginBottom: 24 }}>
              <h3 style={{ color: '#d4380d', margin: '0 0 8px' }}>⚠️ Cuellos de Botella Detectados</h3>
              {policyAnalytics.bottlenecks.map((b) => (
                <div key={b.nodeId} style={{ marginBottom: 6 }}>
                  <strong>{b.nodeTitle}</strong> ({b.departmentName})
                  — Duración prom: <strong>{b.avgDurationMinutes} min</strong>
                  — Pendientes: <strong style={{ color: 'var(--danger)' }}>{b.pendingTasks}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Node stats table */}
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Estadísticas por actividad</h3>
          <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Departamento</th>
                <th>Total Tareas</th>
                <th>Pendientes</th>
                <th>Duración Prom.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {policyAnalytics.nodeStats.map((n) => (
                <tr key={n.nodeId} style={{ background: n.isBottleneck ? '#fff2e8' : 'transparent' }}>
                  <td style={{ fontWeight: n.isBottleneck ? 700 : 400 }}>{n.nodeTitle}</td>
                  <td>{n.departmentName}</td>
                  <td>{n.totalTasks}</td>
                  <td style={{ color: n.pendingTasks >= 3 ? 'var(--danger)' : 'inherit' }}>{n.pendingTasks}</td>
                  <td>{n.avgDurationMinutes} min</td>
                  <td>
                    {n.isBottleneck
                      ? <span className="badge badge-orange">CUELLO DE BOTELLA</span>
                      : <span className="badge badge-green">Normal</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
