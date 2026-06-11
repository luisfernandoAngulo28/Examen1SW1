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
              @if (ml.mlAvailable) {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:3px"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                TensorFlow activo
              } @else {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:3px"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                Heurísticas locales
              }
            </span>
            @if (mlError) {
              <span style="font-size:11px;color:#cf1322;background:#fff2f0;border:1px solid #ffccc7;padding:2px 8px;border-radius:10px;display:inline-flex;align-items:center;gap:4px">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Servicio ML no disponible — mostrando datos vacíos
              </span>
            }
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">

            <!-- Riesgo de demora -->
            <div class="card" style="padding:0;overflow:hidden">
              <div style="padding:12px 16px;background:linear-gradient(135deg,#fff2f0,#fff7e6);border-bottom:1px solid #ffd8bf;display:flex;align-items:center;gap:8px">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4380d" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0958d9" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
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
                        <span [style.display]="'inline-block'" [style.width]="'8px'" [style.height]="'8px'" [style.border-radius]="'50%'"
                              [style.background]="p.priority_label==='CRITICAL'?'#cf1322':p.priority_label==='HIGH'?'#d46b08':p.priority_label==='NORMAL'?'#1677ff':'#d9d9d9'"></span>
                        {{ p.priority_label }}
                      </span>
                      <div style="flex:1;min-width:0">
                        <div style="display:flex;align-items:center;gap:4px">
                          <span style="font-size:11px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.task_title }}</span>
                          @if (p.sla_breach) {
                            <span style="font-size:9px;font-weight:800;background:#ff4d4f;color:#fff;padding:1px 5px;border-radius:6px;flex-shrink:0;letter-spacing:.3px">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:middle;margin-right:2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>SLA
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#531dab" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style="font-weight:700;font-size:13px;color:#531dab">Anomalías Detectadas</span>
              </div>
              @if (ml.anomalies.length === 0) {
                <div style="padding:20px;text-align:center;color:#52c41a;font-size:12px;display:flex;align-items:center;justify-content:center;gap:5px">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Sin anomalías detectadas
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
                      <a [routerLink]="['/policies', p.id, 'editor']" class="btn btn-ghost btn-sm" style="display:inline-flex;align-items:center;gap:4px">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Editar
                      </a>
                    }
                    <a [routerLink]="['/policies', p.id, 'cases']" class="btn btn-warning btn-sm" style="color:#fff;display:inline-flex;align-items:center;gap:4px">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      Trámites
                    </a>
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
