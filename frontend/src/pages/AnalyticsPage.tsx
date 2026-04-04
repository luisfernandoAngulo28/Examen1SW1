import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  if (!stats) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div style={{ padding: 24 }}>
      <Link to="/" style={{ color: '#1677ff', textDecoration: 'none' }}>&larr; Dashboard</Link>
      <h1 style={{ margin: '8px 0 24px' }}>Analytics & Cuellos de Botella</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Total Trámites" value={stats.totalCases} color="#1677ff" />
        <KpiCard label="Activos" value={stats.activeCases} color="#fa8c16" />
        <KpiCard label="Completados" value={stats.completedCases} color="#52c41a" />
        <KpiCard label="Tareas Pendientes" value={stats.pendingTasks} color="#ff4d4f" />
      </div>

      {/* Tasks per department */}
      {stats.tasksPerDepartment.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2>Tareas pendientes por departamento</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stats.tasksPerDepartment.map((d) => (
              <div key={d.name} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '12px 20px', minWidth: 150 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: d.count >= 3 ? '#ff4d4f' : '#333' }}>{d.count}</div>
                <div style={{ color: '#666' }}>{d.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-policy analysis */}
      <h2>Análisis por Política</h2>
      <select
        value={selectedPolicy}
        onChange={(e) => loadPolicyAnalytics(e.target.value)}
        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 16, fontSize: 15 }}
      >
        <option value="">Seleccionar política...</option>
        {policies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {policyAnalytics && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <KpiCard label="Trámites" value={policyAnalytics.totalCases} color="#1677ff" />
            <KpiCard label="Completados" value={policyAnalytics.completedCases} color="#52c41a" />
            <KpiCard label="Duración Prom. (min)" value={policyAnalytics.avgCaseDurationMinutes} color="#722ed1" />
          </div>

          {/* Bottleneck alert */}
          {policyAnalytics.bottlenecks.length > 0 && (
            <div style={{ background: '#fff2e8', border: '1px solid #ffbb96', borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <h3 style={{ color: '#d4380d', margin: '0 0 8px' }}>Cuellos de Botella Detectados</h3>
              {policyAnalytics.bottlenecks.map((b) => (
                <div key={b.nodeId} style={{ marginBottom: 6 }}>
                  <strong>{b.nodeTitle}</strong> ({b.departmentName})
                  — Duración prom: <strong>{b.avgDurationMinutes} min</strong>
                  — Pendientes: <strong style={{ color: '#ff4d4f' }}>{b.pendingTasks}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Node stats table */}
          <h3>Estadísticas por actividad</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Actividad</th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Departamento</th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Total Tareas</th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Pendientes</th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Duración Prom.</th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #eee' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {policyAnalytics.nodeStats.map((n) => (
                <tr key={n.nodeId} style={{ background: n.isBottleneck ? '#fff2e8' : 'transparent' }}>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee', fontWeight: n.isBottleneck ? 700 : 400 }}>{n.nodeTitle}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{n.departmentName}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{n.totalTasks}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee', color: n.pendingTasks >= 3 ? '#ff4d4f' : '#333' }}>{n.pendingTasks}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{n.avgDurationMinutes} min</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>
                    {n.isBottleneck
                      ? <span style={{ color: '#d4380d', fontWeight: 700 }}>CUELLO DE BOTELLA</span>
                      : <span style={{ color: '#52c41a' }}>Normal</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
      <div style={{ color: '#666', marginTop: 4 }}>{label}</div>
    </div>
  );
}
