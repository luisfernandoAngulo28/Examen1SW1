import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { API_BASE } from '../../api';

interface Policy { id: string; name: string; status: string; createdAt: string; }
interface Stats { totalCases: number; activeCases: number; completedCases: number; pendingTasks: number; }
interface CaseRef { id: string; status: string; policy: { id: string; name: string } | null; }

interface RiskItem   { case_id: string; risk_score: number; risk_level: string; recommendation: string; }
interface PrioItem   { task_id: string; task_title: string; department: string; priority_score: number; priority_label: string; sla_breach: number; }
interface AnomalyItem { case_id: string; policy_name: string; is_anomaly: boolean; score: number; description: string; }
interface MlDashboard { delayRisk: RiskItem[]; priority: PrioItem[]; anomalies: AnomalyItem[]; activeCases: number; mlAvailable: boolean; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:8px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </h1>
      @if (auth.user()?.role === 'CLIENT') {
        <a routerLink="/nuevo-proceso" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          Iniciar Trámite por Voz
        </a>
      }
    </div>
    <div class="page-body fade-in">

      @if (stats) {
        <div class="kpi-grid" style="margin-bottom:28px">
          <div class="kpi-card blue">
            <div class="kpi-value" style="color:var(--primary)">{{ stats.totalCases }}</div>
            <div class="kpi-label">Total Trámites</div>
          </div>
          <div class="kpi-card orange">
            <div class="kpi-value" style="color:var(--warning)">{{ stats.activeCases }}</div>
            <div class="kpi-label">En Progreso</div>
          </div>
          <div class="kpi-card green">
            <div class="kpi-value" style="color:var(--success)">{{ stats.completedCases }}</div>
            <div class="kpi-label">Completados</div>
          </div>
          <div class="kpi-card red">
            <div class="kpi-value" style="color:var(--danger)">{{ stats.pendingTasks }}</div>
            <div class="kpi-label">Tareas Pendientes</div>
          </div>
        </div>
      }

      <!-- ── Panel ML / TensorFlow (Mejora 5) ── -->
      @if (ml) {
        <div style="margin-bottom:28px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
            <h2 style="font-size:16px;font-weight:700;margin:0">Predicciones IA</h2>
            <span [style.background]="ml.mlAvailable ? '#f6ffed' : '#fffbe6'"
                  [style.color]="ml.mlAvailable ? '#52c41a' : '#d48806'"
                  [style.border]="'1px solid ' + (ml.mlAvailable ? '#b7eb8f' : '#ffe58f')"
                  style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px">
              {{ ml.mlAvailable ? '🤖 TensorFlow activo' : '📐 Heurísticas locales' }}
            </span>
            @if (mlError) {
              <span style="font-size:11px;color:#cf1322;background:#fff2f0;border:1px solid #ffccc7;padding:2px 8px;border-radius:10px">
                ⚠ Servicio ML no disponible — mostrando datos vacíos
              </span>
            }
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">

            <!-- Riesgo de demora -->
            <div class="card" style="padding:0;overflow:hidden">
              <div style="padding:12px 16px;background:linear-gradient(135deg,#fff2f0,#fff7e6);border-bottom:1px solid #ffd8bf;display:flex;align-items:center;gap:8px">
                <span style="font-size:18px">⚠️</span>
                <span style="font-weight:700;font-size:13px;color:#d4380d">Riesgo de Demora</span>
              </div>
              @if (ml.delayRisk.length === 0) {
                <div style="padding:20px;text-align:center;color:#999;font-size:12px">Sin trámites activos</div>
              } @else {
                <div style="max-height:200px;overflow-y:auto">
                  @for (r of ml.delayRisk; track r.case_id) {
                    <div style="padding:8px 14px;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;gap:8px">
                      <span [style.background]="r.risk_level==='HIGH'?'#fff1f0':r.risk_level==='MEDIUM'?'#fffbe6':'#f6ffed'"
                            [style.color]="r.risk_level==='HIGH'?'#cf1322':r.risk_level==='MEDIUM'?'#d48806':'#389e0d'"
                            style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;flex-shrink:0">
                        {{ r.risk_level === 'HIGH' ? 'ALTO' : r.risk_level === 'MEDIUM' ? 'MEDIO' : 'BAJO' }}
                      </span>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:11px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ caseLabel(r.case_id) }}</div>
                        <div style="font-size:10px;color:#999">Puntuación: {{ (r.risk_score * 100) | number:'1.0-0' }}% · {{ r.recommendation }}</div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Prioridad de tareas -->
            <div class="card" style="padding:0;overflow:hidden">
              <div style="padding:12px 16px;background:linear-gradient(135deg,#f0f5ff,#e6f7ff);border-bottom:1px solid #91caff;display:flex;align-items:center;gap:8px">
                <span style="font-size:18px">🎯</span>
                <span style="font-weight:700;font-size:13px;color:#0958d9">Prioridad de Tareas</span>
              </div>
              @if (ml.priority.length === 0) {
                <div style="padding:20px;text-align:center;color:#999;font-size:12px">Sin tareas pendientes</div>
              } @else {
                <div style="max-height:200px;overflow-y:auto">
                  @for (p of ml.priority; track p.task_id) {
                    <div [style.background]="p.sla_breach ? '#fff0f0' : 'transparent'"
                         style="padding:8px 14px;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;gap:8px">
                      <span [style.background]="p.priority_label==='CRITICAL'?'#fff1f0':p.priority_label==='HIGH'?'#fff7e6':p.priority_label==='NORMAL'?'#f0f5ff':'#f5f5f5'"
                            [style.color]="p.priority_label==='CRITICAL'?'#cf1322':p.priority_label==='HIGH'?'#d46b08':p.priority_label==='NORMAL'?'#1677ff':'#888'"
                            style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;flex-shrink:0">
                        {{ p.priority_label === 'CRITICAL' ? '🔴' : p.priority_label === 'HIGH' ? '🟠' : p.priority_label === 'NORMAL' ? '🔵' : '⚪' }}
                      </span>
                      <div style="flex:1;min-width:0">
                        <div style="display:flex;align-items:center;gap:4px">
                          <span style="font-size:11px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.task_title }}</span>
                          @if (p.sla_breach) {
                            <span style="font-size:9px;font-weight:800;background:#ff4d4f;color:#fff;padding:1px 5px;border-radius:6px;flex-shrink:0;letter-spacing:.3px">
                              ⏰ SLA EXCEDIDO
                            </span>
                          }
                        </div>
                        <div style="font-size:10px;color:#999">{{ p.department }} · {{ p.priority_score | number:'1.0-0' }}pts</div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Anomalías -->
            <div class="card" style="padding:0;overflow:hidden">
              <div style="padding:12px 16px;background:linear-gradient(135deg,#f9f0ff,#f0f5ff);border-bottom:1px solid #d3adf7;display:flex;align-items:center;gap:8px">
                <span style="font-size:18px">🔍</span>
                <span style="font-weight:700;font-size:13px;color:#531dab">Anomalías Detectadas</span>
              </div>
              @if (ml.anomalies.length === 0) {
                <div style="padding:20px;text-align:center;color:#52c41a;font-size:12px">
                  ✓ Sin anomalías detectadas
                </div>
              } @else {
                <div style="max-height:200px;overflow-y:auto">
                  @for (a of ml.anomalies; track a.case_id) {
                    <div style="padding:8px 14px;border-bottom:1px solid #f5f5f5">
                      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                        <span style="font-size:11px;background:#fff0f6;color:#c41d7f;font-weight:700;padding:1px 6px;border-radius:8px">ANOMALÍA</span>
                        <span style="font-size:11px;font-weight:600;color:#555">{{ caseLabel(a.case_id) }}</span>
                      </div>
                      <div style="font-size:10px;color:#999">{{ a.policy_name }} · Score: {{ a.score | number:'1.2-2' }}</div>
                      <div style="font-size:10px;color:#888;margin-top:2px">{{ a.description }}</div>
                    </div>
                  }
                </div>
              }
            </div>

          </div>
        </div>
      }
      <!-- ── /Panel ML ── -->

      <div class="card">
        <div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <h2 style="font-size:16px;font-weight:700">Políticas de Negocio</h2>
          @if (auth.user()?.role === 'ADMIN' || auth.user()?.role === 'DESIGNER') {
            <a routerLink="/policies/new" class="btn btn-primary btn-sm">+ Nueva Política</a>
          }
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th><th>Estado</th><th>Creada</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of policies; track p.id) {
              <tr>
                <td style="font-weight:600">{{ p.name }}</td>
                <td><span [class]="'badge ' + (p.status === 'ACTIVE' ? 'badge-green' : 'badge-gray')">
                  {{ p.status === 'ACTIVE' ? 'ACTIVO' : p.status === 'INACTIVE' ? 'INACTIVO' : p.status }}
                </span></td>
                <td style="color:var(--text-secondary);font-size:13px">{{ p.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div style="display:flex;gap:8px">
                    @if (auth.user()?.role === 'ADMIN' || auth.user()?.role === 'DESIGNER') {
                      <a [routerLink]="['/policies', p.id, 'editor']" class="btn btn-ghost btn-sm">✏ Editar</a>
                    }
                    <a [routerLink]="['/policies', p.id, 'cases']" class="btn btn-warning btn-sm" style="color:#fff">📁 Trámites</a>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="4" style="padding:40px;text-align:center;color:var(--text-secondary)">
                No hay políticas creadas aún.
                @if (auth.user()?.role === 'ADMIN' || auth.user()?.role === 'DESIGNER') {
                  <a routerLink="/policies/new" class="btn btn-primary btn-sm" style="margin-left:12px">+ Crear primera política</a>
                }
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  policies: Policy[] = [];
  stats: Stats | null = null;
  ml: MlDashboard | null = null;
  mlError = false;
  caseNameMap: Record<string, string> = {};
  private http = inject(HttpClient);
  readonly auth = inject(AuthService);

  caseLabel(caseId: string): string {
    return this.caseNameMap[caseId] ?? caseId.slice(0, 8) + '...';
  }

  ngOnInit() {
    this.http.get<Policy[]>(`${API_BASE}/policies`).subscribe(d => this.policies = d);
    this.http.get<Stats>(`${API_BASE}/analytics/dashboard`).subscribe({ next: d => this.stats = d, error: () => {} });
    this.http.get<MlDashboard>(`${API_BASE}/ml/dashboard`).subscribe({
      next: d => { this.ml = d; this.mlError = false; },
      error: () => {
        this.mlError = true;
        this.ml = { delayRisk: [], priority: [], anomalies: [], activeCases: 0, mlAvailable: false };
      }
    });
    this.http.get<CaseRef[]>(`${API_BASE}/cases`).subscribe({
      next: cases => cases.forEach((c, i) => {
        this.caseNameMap[c.id] = (c.policy?.name ?? 'Trámite') + ` #${i + 1}`;
      }),
      error: () => {}
    });
  }
}
