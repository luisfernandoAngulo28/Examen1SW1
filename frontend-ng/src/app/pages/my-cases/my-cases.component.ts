import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../api';

interface CaseItem {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  policy: { id: string; name: string } | null;
  tasks: { status: string }[];
}

@Component({
  selector: 'app-my-cases',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Mis Trámites</h1>
    </div>
    <div class="page-body fade-in">

      @if (loading) {
        <div style="text-align:center;padding:60px;color:var(--text-secondary)">
          <div class="spinner"></div>
          <div style="margin-top:12px;font-size:13px">Cargando trámites...</div>
        </div>
      } @else if (cases.length === 0) {
        <div class="card" style="padding:60px;text-align:center;color:var(--text-secondary)">
          <div style="font-size:40px;margin-bottom:16px">📂</div>
          <div style="font-size:16px;font-weight:600;margin-bottom:8px">No tienes trámites iniciados</div>
          <div style="font-size:13px;margin-bottom:24px">Cuando inicies un trámite aparecerá aquí con su estado en tiempo real.</div>
          <a routerLink="/" class="btn btn-primary">← Ir al Dashboard</a>
        </div>
      } @else {
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:700;font-size:15px">{{ cases.length }} trámite(s)</span>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Proceso</th>
                <th>Estado</th>
                <th>Tareas</th>
                <th>Iniciado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (c of cases; track c.id) {
                <tr>
                  <td style="font-weight:600">{{ c.policy?.name ?? 'Trámite' }}</td>
                  <td>
                    <span [class]="'badge ' + statusBadge(c.status)">
                      {{ statusLabel(c.status) }}
                    </span>
                  </td>
                  <td style="font-size:13px;color:var(--text-secondary)">
                    {{ doneTasks(c) }}/{{ c.tasks.length }}
                    <span style="color:#52c41a;margin-left:4px">✓</span>
                  </td>
                  <td style="font-size:13px;color:var(--text-secondary)">
                    {{ c.startedAt | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td>
                    <a [routerLink]="['/cases', c.id]" class="btn btn-ghost btn-sm">Ver detalle →</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class MyCasesComponent implements OnInit {
  cases: CaseItem[] = [];
  loading = true;
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<CaseItem[]>(`${API_BASE}/cases/my-cases`).subscribe({
      next: d => { this.cases = d.sort((a, b) => b.startedAt?.localeCompare(a.startedAt ?? '') ?? 0); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  doneTasks(c: CaseItem): number {
    return c.tasks.filter(t => t.status === 'DONE').length;
  }

  statusLabel(s: string): string {
    return { IN_PROGRESS: 'En Progreso', COMPLETED: 'Completado', CANCELLED: 'Cancelado', OPEN: 'Abierto' }[s] ?? s;
  }

  statusBadge(s: string): string {
    return { IN_PROGRESS: 'badge-orange', COMPLETED: 'badge-green', CANCELLED: 'badge-gray', OPEN: 'badge-blue' }[s] ?? 'badge-gray';
  }
}
