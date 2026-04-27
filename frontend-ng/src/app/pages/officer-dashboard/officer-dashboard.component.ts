import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import { AuthService } from '../../services/auth.service';
import { TrafficLightComponent } from '../../components/traffic-light/traffic-light.component';
import { API_BASE } from '../../api';

const WS_BASE = API_BASE.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');

interface MyTask {
  id: string;
  status: string;
  startedAt: string;
  node: { title: string; department?: { name: string } };
  case: { id: string; policy: { name: string } };
  assignedUser?: { name: string } | null;
}

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TrafficLightComponent],
  template: `
    <div class="page-header">
      <h1>Mi Bandeja de Trabajo</h1>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="color:var(--text-secondary);font-size:14px">Bienvenido, <strong>{{ auth.user()?.name }}</strong></span>
        <span class="badge" [class]="connected ? 'badge-green' : 'badge-red'" style="font-size:11px;padding:3px 8px">
          {{ connected ? '● En vivo' : '○ Reconectando' }}
        </span>
      </div>
    </div>
    <div class="page-body fade-in">
      <div class="kpi-grid" style="margin-bottom:28px">
        <div class="kpi-card orange"><div class="kpi-value" style="color:var(--warning)">{{ pendingCount }}</div><div class="kpi-label">Pendientes</div></div>
        <div class="kpi-card blue"><div class="kpi-value" style="color:var(--primary)">{{ inProgressCount }}</div><div class="kpi-label">En Progreso</div></div>
        <div class="kpi-card green"><div class="kpi-value" style="color:var(--success)">{{ doneCount }}</div><div class="kpi-label">Completadas</div></div>
        <div class="kpi-card"><div class="kpi-value">{{ tasks.length }}</div><div class="kpi-label">Total Asignadas</div></div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button [class]="'btn btn-sm ' + (filter==='all' ? 'btn-primary' : 'btn-ghost')" (click)="filter='all'">Todas ({{ tasks.length }})</button>
        <button [class]="'btn btn-sm ' + (filter==='mine' ? 'btn-primary' : 'btn-ghost')" (click)="filter='mine'">Mis tareas</button>
        <button [class]="'btn btn-sm ' + (filter==='pending' ? 'btn-warning' : 'btn-ghost')" [style.color]="filter==='pending'?'#fff':''" (click)="filter='pending'">Sin asignar</button>
        <span style="flex:1"></span>
        <button [class]="'btn btn-sm ' + (sortByPriority ? 'btn-primary' : 'btn-ghost')" (click)="sortByPriority=!sortByPriority" title="Ordenar por prioridad">
          ↑↓ {{ sortByPriority ? 'Por prioridad' : 'Sin orden' }}
        </button>
      </div>

      <div class="card">
        <table class="table">
          <thead><tr><th>Estado</th><th>Actividad</th><th>Departamento</th><th>Política</th><th>Asignado</th><th>Prioridad</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (t of filtered; track t.id) {
              <tr>
                <td><app-traffic-light [status]="t.status" [showLabel]="true" /></td>
                <td style="font-weight:600">{{ t.node.title }}</td>
                <td>{{ t.node.department?.name || '—' }}</td>
                <td>{{ t.case.policy.name }}</td>
                <td>{{ t.assignedUser?.name || 'Sin asignar' }}</td>
                <td>
                  <span [style.background]="taskPriority(t)===3?'#fff1f0':taskPriority(t)===2?'#fffbe6':'#f6ffed'"
                        [style.color]="taskPriority(t)===3?'#cf1322':taskPriority(t)===2?'#d48806':'#389e0d'"
                        [style.border]="'1px solid '+(taskPriority(t)===3?'#ffa39e':taskPriority(t)===2?'#ffe58f':'#b7eb8f')"
                        style="font-size:11px;border-radius:4px;padding:2px 7px;font-weight:600">
                    {{ taskPriority(t)===3 ? '🔴 Alta' : taskPriority(t)===2 ? '🟡 Media' : '🟢 Baja' }}
                  </span>
                </td>
                <td><a [routerLink]="['/cases', t.case.id]" class="btn btn-primary btn-sm">{{ t.status === 'DONE' ? 'Ver' : 'Atender' }}</a></td>
              </tr>
            }
            @empty {
              <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-secondary)">No hay tareas asignadas</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class OfficerDashboardComponent implements OnInit, OnDestroy {
  tasks: MyTask[] = [];
  filter: 'all' | 'mine' | 'pending' = 'all';
  sortByPriority = true;
  connected = false;
  auth = inject(AuthService);
  private http = inject(HttpClient);
  private stompClient?: Client;

  get filtered() {
    let result: MyTask[];
    if (this.filter === 'mine') result = this.tasks.filter(t => t.assignedUser?.name === this.auth.user()?.name);
    else if (this.filter === 'pending') result = this.tasks.filter(t => t.status === 'PENDING' && !t.assignedUser);
    else result = [...this.tasks];
    if (this.sortByPriority) result.sort((a, b) => this.taskPriority(b) - this.taskPriority(a));
    return result;
  }
  taskPriority(t: MyTask): number {
    if (t.status === 'DONE') return 0;
    const ageH = (Date.now() - new Date(t.startedAt).getTime()) / 3600000;
    if (t.status === 'PENDING' && !t.assignedUser) return 3;
    if (ageH > 4) return 3;
    if (t.status === 'IN_PROGRESS' && ageH > 2) return 2;
    if (t.status === 'PENDING') return 2;
    return 1;
  }
  get pendingCount() { return this.tasks.filter(t => t.status === 'PENDING').length; }
  get inProgressCount() { return this.tasks.filter(t => t.status === 'IN_PROGRESS').length; }
  get doneCount() { return this.tasks.filter(t => t.status === 'DONE').length; }

  ngOnInit() {
    this.loadTasks();
    this.connectStomp();
  }

  ngOnDestroy() { this.stompClient?.deactivate(); }

  loadTasks() {
    this.http.get<MyTask[]>(`${API_BASE}/cases/my-tasks`).subscribe(d => this.tasks = d);
  }

  connectStomp() {
    this.stompClient = new Client({
      brokerURL: `${WS_BASE}/ws/websocket`,
      reconnectDelay: 3000,
      onConnect: () => {
        this.connected = true;
        this.stompClient!.subscribe('/topic/events', (msg) => {
          const payload = JSON.parse(msg.body);
          if (['case:started', 'task:completed', 'task:assigned', 'case:completed', 'case:cancelled'].includes(payload.type)) {
            this.loadTasks();
          }
        });
      },
      onDisconnect: () => this.connected = false,
    });
    this.stompClient.activate();
  }
}
