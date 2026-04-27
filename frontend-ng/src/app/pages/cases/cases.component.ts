import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { TrafficLightComponent } from '../../components/traffic-light/traffic-light.component';
import { API_BASE } from '../../api';

interface Task {
  id: string; status: string; startedAt: string; finishedAt: string | null;
  node: { id: string; title: string; department?: { name: string } };
  assignedUser: { id: string; name: string; email: string } | null;
}
interface Case {
  id: string; status: string; startedAt: string; finishedAt: string | null;
  policy: { id: string; name: string }; tasks: Task[];
}

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [CommonModule, RouterLink, TrafficLightComponent],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/" style="font-size:13px;display:inline-flex;align-items:center;gap:4px">← Dashboard</a>
        <h1 style="margin-top:4px">Trámites: {{ policyName }}</h1>
      </div>
      <button (click)="startCase()" class="btn btn-primary">+ Iniciar Trámite</button>
    </div>
    <div class="page-body fade-in">
      @if (loading) {
        <div class="loading-page"><div class="spinner"></div><span>Cargando trámites...</span></div>
      } @else {
        <div class="card">
          <table class="table">
            <thead><tr><th>ID</th><th>Estado</th><th>Iniciado</th><th>Tareas</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (c of cases; track c.id) {
                <tr>
                  <td style="font-family:monospace;font-size:12px;color:var(--text-secondary)">{{ c.id | slice:0:8 }}...</td>
                  <td><app-traffic-light [status]="c.status" [showLabel]="true" /></td>
                  <td style="font-size:13px;color:var(--text-secondary)">{{ c.startedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <div style="display:flex;gap:4px;flex-wrap:wrap">
                      @for (t of c.tasks.slice(0,3); track t.id) {
                        <span [class]="'badge ' + taskBadge(t.status)" style="font-size:10px">{{ t.node.title | slice:0:15 }}</span>
                      }
                    </div>
                  </td>
                  <td><a [routerLink]="['/cases', c.id]" class="btn btn-primary btn-sm">👁 Ver</a></td>
                </tr>
              }
              @empty {
                <tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-secondary)">
                  No hay trámites aún.
                  <button (click)="startCase()" class="btn btn-primary btn-sm" style="margin-left:12px">Iniciar primero</button>
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class CasesComponent implements OnInit {
  cases: Case[] = [];
  policyName = '';
  loading = true;
  private policyId = '';
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  ngOnInit() {
    this.policyId = this.route.snapshot.paramMap.get('policyId')!;
    this.loadCases();
    this.http.get<any>(`${API_BASE}/policies/${this.policyId}`).subscribe({ next: p => this.policyName = p.name, error: () => {} });
  }

  loadCases() {
    this.loading = true;
    this.http.get<Case[]>(`${API_BASE}/cases?policyId=${this.policyId}`).subscribe({
      next: (d) => { this.cases = d; if (d.length > 0) this.policyName = d[0].policy.name; this.loading = false; },
      error: () => this.loading = false
    });
  }

  startCase() {
    this.http.post(`${API_BASE}/cases`, { policyId: this.policyId }).subscribe({
      next: () => { this.toast.show('Trámite iniciado', 'success'); this.loadCases(); },
      error: () => this.toast.show('Error al iniciar trámite', 'error')
    });
  }

  taskBadge(status: string) {
    return status === 'DONE' ? 'badge-green' : status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray';
  }
}
