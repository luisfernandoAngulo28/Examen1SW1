import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../api';

interface DashboardStats {
  totalCases: number; activeCases: number; completedCases: number; cancelledCases: number;
  totalTasks: number; pendingTasks: number; tasksPerDepartment: { name: string; count: number }[];
}
interface NodeStat {
  nodeId: string; nodeTitle: string; departmentName: string;
  avgDurationMinutes: number; totalTasks: number; pendingTasks: number; isBottleneck: boolean;
}
interface PolicyAnalytics {
  policyId: string; policyName: string; totalCases: number; completedCases: number;
  avgCaseDurationMinutes: number; nodeStats: NodeStat[]; bottlenecks: NodeStat[];
  aiInsights?: { severity: 'critical' | 'warning' | 'info' | 'success'; message: string; action: string }[];
}
interface Policy { id: string; name: string; }

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (!stats) {
      <div class="loading-page"><div class="spinner"></div><span>Cargando analytics...</span></div>
    } @else {
      <div class="page-header">
        <h1>Analytics &amp; Cuellos de Botella</h1>
      </div>
      <div class="page-body fade-in">
        <div class="kpi-grid" style="margin-bottom:28px">
          <div class="kpi-card"><div class="kpi-value" style="color:var(--primary)">{{ stats.totalCases }}</div><div class="kpi-label">Total Trámites</div></div>
          <div class="kpi-card orange"><div class="kpi-value" style="color:var(--warning)">{{ stats.activeCases }}</div><div class="kpi-label">Activos</div></div>
          <div class="kpi-card green"><div class="kpi-value" style="color:var(--success)">{{ stats.completedCases }}</div><div class="kpi-label">Completados</div></div>
          <div class="kpi-card red"><div class="kpi-value" style="color:var(--danger)">{{ stats.pendingTasks }}</div><div class="kpi-label">Tareas Pendientes</div></div>
        </div>

        @if (stats.tasksPerDepartment.length > 0) {
          <div style="margin-bottom:32px">
            <h2 style="font-size:16px;font-weight:700;margin-bottom:12px">Carga por Departamento</h2>
            <div class="card" style="padding:24px">
              @for (d of stats.tasksPerDepartment; track d.name) {
                <div style="display:flex;align-items:center;margin-bottom:12px">
                  <span style="width:120px;font-size:13px;font-weight:600;flex-shrink:0">{{ d.name }}</span>
                  <div style="flex:1;background:#f1f5f9;border-radius:8px;height:28px;overflow:hidden;position:relative">
                    <div [style.width.%]="(d.count/maxDeptCount)*100"
                         [style.background]="d.count >= 3 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#3b82f6,#2563eb)'"
                         style="height:100%;border-radius:8px;min-width:0;transition:width 0.6s ease"></div>
                    <span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:700;color:#334155">{{ d.count }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <h2 style="font-size:16px;font-weight:700;margin-bottom:12px">Análisis por Política</h2>
        <select [(ngModel)]="selectedPolicyId" (ngModelChange)="loadPolicyAnalytics($event)" class="form-input" style="max-width:400px;margin-bottom:16px">
          <option value="">Seleccionar política...</option>
          @for (p of policies; track p.id) {
            <option [value]="p.id">{{ p.name }}</option>
          }
        </select>

        @if (policyAnalytics) {
          <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
            <div class="kpi-card"><div class="kpi-value" style="color:var(--primary)">{{ policyAnalytics.totalCases }}</div><div class="kpi-label">Trámites</div></div>
            <div class="kpi-card green"><div class="kpi-value" style="color:var(--success)">{{ policyAnalytics.completedCases }}</div><div class="kpi-label">Completados</div></div>
            <div class="kpi-card"><div class="kpi-value" style="color:#722ed1">{{ policyAnalytics.avgCaseDurationMinutes > 0 ? policyAnalytics.avgCaseDurationMinutes + ' min' : '—' }}</div><div class="kpi-label">Duración Prom.</div></div>
          </div>

          @if (policyAnalytics.bottlenecks?.length) {
            <div class="card" style="background:#fff2e8;border:1px solid #ffbb96;padding:16px;margin-bottom:24px">
              <h3 style="color:#d4380d;margin:0 0 8px;display:flex;align-items:center;gap:6px">⚠ Cuellos de Botella Detectados</h3>
              @for (b of policyAnalytics.bottlenecks; track b.nodeId) {
                <div style="margin-bottom:6px">
                  <strong>{{ b.nodeTitle }}</strong> ({{ b.departmentName }})
                  — Duración prom: <strong>{{ b.avgDurationMinutes }} min</strong>
                  — Pendientes: <strong style="color:var(--danger)">{{ b.pendingTasks }}</strong>
                </div>
              }
            </div>
          }

          @if (policyAnalytics.aiInsights?.length) {
            <h3 style="font-size:15px;font-weight:700;margin-bottom:12px">💡 Sugerencias Inteligentes</h3>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
              @for (ins of policyAnalytics.aiInsights!; track $index) {
                <div class="card" [style.border-left]="'4px solid ' + insightColor(ins.severity)" style="padding:14px 18px">
                  <div style="font-weight:600;margin-bottom:4px">{{ ins.message }}</div>
                  <div style="font-size:13px;color:var(--text-secondary)">→ {{ ins.action }}</div>
                </div>
              }
            </div>
          }

          <h3 style="font-size:15px;font-weight:700;margin-bottom:8px">Estadísticas por Nodo</h3>
          <div class="card">
            <table class="table">
              <thead><tr><th>Nodo</th><th>Departamento</th><th>Tareas</th><th>Pendientes</th><th>Prom. (min)</th><th>Estado</th></tr></thead>
              <tbody>
                @for (n of policyAnalytics.nodeStats; track n.nodeId) {
                  <tr>
                    <td style="font-weight:600">{{ n.nodeTitle }}</td>
                    <td>{{ n.departmentName }}</td>
                    <td>{{ n.totalTasks }}</td>
                    <td [style.color]="n.pendingTasks > 0 ? 'var(--danger)' : 'var(--success)'">{{ n.pendingTasks }}</td>
                    <td>{{ n.avgDurationMinutes > 0 ? (n.avgDurationMinutes | number:'1.0-0') + ' min' : '—' }}</td>
                    <td>
                      @if (n.isBottleneck) {
                        <span class="badge badge-red">⚠ Cuello</span>
                      } @else {
                        <span class="badge badge-green">✓ Normal</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    }
  `
})
export class AnalyticsComponent implements OnInit {
  stats: DashboardStats | null = null;
  policies: Policy[] = [];
  selectedPolicyId = '';
  policyAnalytics: PolicyAnalytics | null = null;
  private http = inject(HttpClient);

  get maxDeptCount() {
    if (!this.stats) return 1;
    return Math.max(...this.stats.tasksPerDepartment.map(d => d.count), 1);
  }

  ngOnInit() {
    this.http.get<DashboardStats>(`${API_BASE}/analytics/dashboard`).subscribe(d => this.stats = d);
    this.http.get<Policy[]>(`${API_BASE}/policies`).subscribe(d => this.policies = d);
  }

  loadPolicyAnalytics(id: string) {
    if (!id) { this.policyAnalytics = null; return; }
    this.http.get<PolicyAnalytics>(`${API_BASE}/analytics/policy/${id}`).subscribe(d => this.policyAnalytics = d);
  }

  insightColor(severity: string) {
    return severity === 'critical' ? '#dc2626' : severity === 'warning' ? '#fa8c16' : severity === 'success' ? '#52c41a' : '#1677ff';
  }
}
