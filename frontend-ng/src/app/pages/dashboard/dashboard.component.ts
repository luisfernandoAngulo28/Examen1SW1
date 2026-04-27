import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../api';

interface Policy { id: string; name: string; status: string; createdAt: string; }
interface Stats { totalCases: number; activeCases: number; completedCases: number; pendingTasks: number; }

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

      <div class="card">
        <div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <h2 style="font-size:16px;font-weight:700">Políticas de Negocio</h2>
          <a routerLink="/policies/new" class="btn btn-primary btn-sm">+ Nueva Política</a>
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
                <td><span [class]="'badge ' + (p.status === 'ACTIVE' ? 'badge-green' : 'badge-gray')">{{ p.status }}</span></td>
                <td style="color:var(--text-secondary);font-size:13px">{{ p.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div style="display:flex;gap:8px">
                    <a [routerLink]="['/policies', p.id, 'editor']" class="btn btn-ghost btn-sm">✏ Editar</a>
                    <a [routerLink]="['/policies', p.id, 'cases']" class="btn btn-warning btn-sm" style="color:#fff">📁 Trámites</a>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="4" style="padding:40px;text-align:center;color:var(--text-secondary)">
                No hay políticas creadas aún.
                <a routerLink="/policies/new" class="btn btn-primary btn-sm" style="margin-left:12px">+ Crear primera política</a>
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
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<Policy[]>(`${API_BASE}/policies`).subscribe(d => this.policies = d);
    this.http.get<Stats>(`${API_BASE}/analytics/dashboard`).subscribe({ next: d => this.stats = d, error: () => {} });
  }
}
