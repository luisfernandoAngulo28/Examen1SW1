import { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle, TrendingUp, Bot, Lightbulb, CircleDot } from 'lucide-react';
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
  aiInsights?: { severity: 'critical' | 'warning' | 'info' | 'success'; message: string; action: string }[];
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
        <h1><BarChart3 size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Analytics & Cuellos de Botella</h1>
      </div>
      <div className="page-body fade-in">

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--primary)' }}>{stats.totalCases}</div><div className="kpi-label">Total Trámites</div></div>
        <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--warning)' }}>{stats.activeCases}</div><div className="kpi-label">Activos</div></div>
        <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--success)' }}>{stats.completedCases}</div><div className="kpi-label">Completados</div></div>
        <div className="kpi-card"><div className="kpi-value" style={{ color: 'var(--danger)' }}>{stats.pendingTasks}</div><div className="kpi-label">Tareas Pendientes</div></div>
      </div>

      {/* Tasks per department — BAR CHART */}
      {stats.tasksPerDepartment.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}><BarChart3 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Carga por Departamento</h2>
          <div className="card" style={{ padding: 24 }}>
            {(() => {
              const max = Math.max(...stats.tasksPerDepartment.map((d) => d.count), 1);
              return stats.tasksPerDepartment.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ width: 120, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{d.name}</span>
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 8, height: 28, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${(d.count / max) * 100}%`,
                      height: '100%',
                      background: d.count >= 3 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      borderRadius: 8,
                      transition: 'width 0.6s ease',
                      minWidth: d.count > 0 ? 24 : 0,
                    }} />
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: '#334155' }}>
                      {d.count}
                    </span>
                  </div>
                </div>
              ));
            })()}
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
              <h3 style={{ color: '#d4380d', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={18} />Cuellos de Botella Detectados</h3>
              {policyAnalytics.bottlenecks.map((b) => (
                <div key={b.nodeId} style={{ marginBottom: 6 }}>
                  <strong>{b.nodeTitle}</strong> ({b.departmentName})
                  — Duración prom: <strong>{b.avgDurationMinutes} min</strong>
                  — Pendientes: <strong style={{ color: 'var(--danger)' }}>{b.pendingTasks}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Duration bar chart per activity */}
          {policyAnalytics.nodeStats.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><BarChart3 size={16} />Duración Promedio por Actividad</h3>
              <div className="card" style={{ padding: 24 }}>
                {(() => {
                  const max = Math.max(...policyAnalytics.nodeStats.map((n) => n.avgDurationMinutes), 1);
                  return policyAnalytics.nodeStats.map((n) => (
                    <div key={n.nodeId} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ width: 140, fontSize: 12, fontWeight: 600, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.isBottleneck && <CircleDot size={12} color="#ef4444" style={{ marginRight: 4, flexShrink: 0 }} />}{n.nodeTitle}
                      </span>
                      <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 8, height: 24, overflow: 'hidden', position: 'relative' }}>
                        <div style={{
                          width: `${(n.avgDurationMinutes / max) * 100}%`,
                          height: '100%',
                          background: n.isBottleneck
                            ? 'linear-gradient(90deg, #f97316, #ea580c)'
                            : 'linear-gradient(90deg, #10b981, #059669)',
                          borderRadius: 8,
                          transition: 'width 0.6s ease',
                          minWidth: n.avgDurationMinutes > 0 ? 20 : 0,
                        }} />
                        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#334155' }}>
                          {n.avgDurationMinutes} min
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Completion rate donut */}
          {policyAnalytics.totalCases > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={16} />Tasa de Completitud</h3>
              <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 32 }}>
                {(() => {
                  const pct = Math.round((policyAnalytics.completedCases / policyAnalytics.totalCases) * 100);
                  const size = 120;
                  const stroke = 12;
                  const radius = (size - stroke) / 2;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference - (pct / 100) * circumference;
                  return (
                    <>
                      <svg width={size} height={size} style={{ flexShrink: 0 }}>
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                          stroke={pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth={stroke} strokeLinecap="round"
                          strokeDasharray={circumference} strokeDashoffset={offset}
                          transform={`rotate(-90 ${size / 2} ${size / 2})`}
                          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" style={{ fontSize: 22, fontWeight: 800, fill: '#1e293b' }}>
                          {pct}%
                        </text>
                      </svg>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{policyAnalytics.completedCases} / {policyAnalytics.totalCases}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>trámites completados</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Duración promedio: <strong>{policyAnalytics.avgCaseDurationMinutes} min</strong></div>
                      </div>
                    </>
                  );
                })()}
              </div>
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

      {/* AI Insights Panel */}
      {policyAnalytics && policyAnalytics.aiInsights && policyAnalytics.aiInsights.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Bot size={20} />Análisis Inteligente (IA)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {policyAnalytics.aiInsights.map((insight, idx) => {
              const colors = {
                critical: { bg: '#fef2f2', border: '#fca5a5', color: '#ef4444', text: '#991b1b' },
                warning: { bg: '#fffbeb', border: '#fcd34d', color: '#f59e0b', text: '#92400e' },
                info: { bg: '#eff6ff', border: '#93c5fd', color: '#3b82f6', text: '#1e40af' },
                success: { bg: '#f0fdf4', border: '#86efac', color: '#22c55e', text: '#166534' },
              };
              const c = colors[insight.severity];
              return (
                <div key={idx} className="card" style={{ background: c.bg, border: `1px solid ${c.border}`, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CircleDot size={20} color={c.color} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: c.text, fontSize: 14 }}>{insight.message}</p>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Lightbulb size={13} color="#f59e0b" /><strong>Recomendación:</strong></span> {insight.action}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
