import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import { ToastService } from '../../services/toast.service';
import { TrafficLightComponent } from '../../components/traffic-light/traffic-light.component';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form.component';
import { DocumentManagerComponent } from '../../components/document-manager/document-manager.component';
import { API_BASE } from '../../api';

const WS_BASE = API_BASE.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');

interface Department { id: string; name: string; }
interface Task {
  id: string; status: string; startedAt: string; finishedAt: string | null;
  node: { id: string; title: string; nodeType?: string; department: Department };
  assignedUser: { id: string; name: string; email: string } | null;
  formSubmission: any;
}
interface EventLog { id: string; type: string; payloadJson: any; createdAt: string; }
interface CaseDetail {
  id: string; status: string; currentNodeId: string | null;
  startedAt: string; finishedAt: string | null;
  policy: { id: string; name: string }; tasks: Task[]; eventLogs: EventLog[];
}
interface UserOption { id: string; name: string; email: string; }

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TrafficLightComponent, DynamicFormComponent, DocumentManagerComponent],
  template: `
    @if (!caseData) {
      <div class="loading-page"><div class="spinner"></div><span>Cargando trámite...</span></div>
    } @else {
      <div class="page-header">
        <div>
          <a [routerLink]="['/policies', caseData.policy.id, 'cases']" style="font-size:13px">← Volver a trámites</a>
          <h1 style="margin-top:4px">Trámite: {{ caseData.policy.name }}</h1>
          <p style="color:var(--text-secondary);margin:4px 0 0;font-size:13px">
            ID: <code>{{ caseData.id }}</code> · Iniciado: {{ caseData.startedAt | date:'dd/MM/yyyy HH:mm' }}
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <app-traffic-light [status]="caseData.status" [size]="18" [showLabel]="true" />
          <span class="badge" [class]="wsConnected ? 'badge-green' : 'badge-red'" style="font-size:11px;padding:3px 8px">{{ wsConnected ? '● En vivo' : '○ Reconectando' }}</span>
          @if (caseData.status !== 'COMPLETED' && caseData.status !== 'CANCELLED') {
            <button (click)="cancel()" class="btn btn-danger">✗ Cancelar trámite</button>
          }
        </div>
      </div>

      <div class="page-body fade-in">
        <h2 style="font-size:16px;font-weight:700;margin-bottom:12px">Tareas del flujo</h2>
        <div style="display:flex;flex-direction:column;gap:12px">
          @for (task of visibleTasks; track task.id) {
            <div class="task-card" [style.border-left-color]="statusColor[task.status]">
              <div class="task-card-header">
                <div>
                  <strong style="font-size:15px">{{ task.node.title }}</strong>
                  <span style="margin-left:12px;color:var(--text-secondary);font-size:13px">[{{ task.node.department?.name || 'Sin depto' }}]</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px">
                  <app-traffic-light [status]="task.status" [size]="12" />
                  <span [class]="'badge ' + taskBadge(task.status)">{{ task.status }}</span>
                </div>
              </div>

              <div class="task-card-actions">
                @if (task.status !== 'DONE') {
                  <div style="display:flex;align-items:center;gap:6px">
                    <label style="font-size:13px;color:var(--text-secondary)">Asignar a:</label>
                    <select class="form-input" style="width:auto;padding:4px 8px"
                      [value]="task.assignedUser?.id || ''"
                      (change)="assign(task.id, $any($event.target).value)">
                      <option value="">Sin asignar</option>
                      @for (u of users; track u.id) {
                        <option [value]="u.id">{{ u.name }} ({{ u.email }})</option>
                      }
                    </select>
                  </div>

                  @if ((decisionEdges[task.id] || []).length > 0) {
                    <div style="display:flex;align-items:center;gap:6px">
                      <span style="font-size:13px;color:var(--text-secondary);font-weight:600">◇ Decidir:</span>
                      @for (de of (decisionEdges[task.id] || []); track de.conditionLabel) {
                        <button (click)="complete(task.id, de.conditionLabel)" class="btn btn-warning btn-sm" style="color:#fff">{{ de.conditionLabel }}</button>
                      }
                    </div>
                  } @else {
                    <button (click)="complete(task.id)" class="btn btn-success btn-sm">✓ Completar</button>
                  }
                }

                @if (task.assignedUser) {
                  <span style="font-size:13px;color:var(--text-secondary)">Asignado: <strong>{{ task.assignedUser.name }}</strong></span>
                }
                @if (task.finishedAt) {
                  <span style="font-size:13px;color:var(--success)">Completada: {{ task.finishedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                }
              </div>

              @if (formTemplates[task.node.id]) {
                <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
                  <button type="button" class="btn btn-ghost btn-sm" (click)="toggleForm(task.id)" style="margin-bottom:8px">
                    {{ expandedForms.has(task.id) ? '▾' : '▸' }} Formulario
                    @if (formSubmissions[task.id]) { <span class="badge badge-green" style="margin-left:8px">✓</span> }
                  </button>
                  @if (expandedForms.has(task.id)) {
                    <app-dynamic-form
                      [schema]="formTemplates[task.node.id]"
                      [initial]="formSubmissions[task.id]"
                      (submitted)="submitForm(task.id, $event)" />
                  }
                </div>
              }
              <!-- Gestión documental por trámite (Mejora 1 — Ciclo 2) -->
              @if (caseData) {
                <app-document-manager
                  [caseId]="caseData.id"
                  [nodeId]="task.node.id" />
              }
            </div>
          }
        </div>

        <h2 style="margin-top:32px;font-size:16px;font-weight:700;margin-bottom:12px">Historial de eventos</h2>
        <div class="card">
          <table class="table">
            <thead><tr><th>Evento</th><th>Hora</th></tr></thead>
            <tbody>
              @for (log of caseData.eventLogs; track log.id) {
                <tr>
                  <td><span class="badge badge-blue">{{ log.type }}</span></td>
                  <td style="color:var(--text-secondary);font-size:13px">{{ log.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                </tr>
              }
              @empty {
                <tr><td colspan="2" style="text-align:center;padding:24px;color:var(--text-secondary)">Sin eventos aún</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class CaseDetailComponent implements OnInit, OnDestroy {
  caseData: CaseDetail | null = null;
  users: UserOption[] = [];
  formTemplates: Record<string, any> = {};
  formSubmissions: Record<string, any> = {};
  decisionEdges: Record<string, { conditionLabel: string; toNodeId: string }[]> = {};
  expandedForms = new Set<string>();
  wsConnected = false;

  readonly statusColor: Record<string, string> = { PENDING: '#999', IN_PROGRESS: '#fa8c16', DONE: '#52c41a', BLOCKED: '#ff4d4f' };
  private id = '';
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private stompClient?: Client;

  get visibleTasks() {
    return (this.caseData?.tasks || []).filter(t => !['INITIAL', 'FORK', 'JOIN', 'FINAL'].includes(t.node.nodeType || 'ACTION'));
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.load();
    this.http.get<UserOption[]>(`${API_BASE}/auth/users`).subscribe({ next: u => this.users = u, error: () => {} });
    this.connectStomp();
  }

  ngOnDestroy() { this.stompClient?.deactivate(); }

  connectStomp() {
    this.stompClient = new Client({
      brokerURL: `${WS_BASE}/ws/websocket`,
      reconnectDelay: 3000,
      onConnect: () => {
        this.wsConnected = true;
        this.stompClient!.subscribe('/topic/events', (msg) => {
          const payload = JSON.parse(msg.body);
          const caseId: string | undefined = payload.data?.id || payload.data?.caseId;
          if (caseId === this.id && ['task:completed', 'task:assigned', 'case:completed', 'case:cancelled'].includes(payload.type)) {
            this.load();
          }
        });
      },
      onDisconnect: () => this.wsConnected = false,
    });
    this.stompClient.activate();
  }

  load() {
    this.http.get<CaseDetail>(`${API_BASE}/cases/${this.id}`).subscribe(c => {
      this.caseData = c;
      c.tasks.forEach(t => {
        this.http.get<any>(`${API_BASE}/forms/template/${t.node.id}`).subscribe({ next: r => { if (r) this.formTemplates[t.node.id] = r.schemaJson; }, error: () => {} });
        this.http.get<any>(`${API_BASE}/forms/submission/${t.id}`).subscribe({ next: r => { if (r) this.formSubmissions[t.id] = r.payloadJson; }, error: () => {} });
      });
      if (c.policy?.id) {
        this.http.get<any>(`${API_BASE}/policies/${c.policy.id}`).subscribe(p => {
          const edges = p.edges || [];
          const decNodes = c.tasks.filter(t => t.node.nodeType === 'DECISION' && t.status !== 'DONE');
          const map: Record<string, any[]> = {};
          decNodes.forEach(t => {
            const nodeEdges = edges.filter((e: any) => e.fromNodeId === t.node.id && e.conditionLabel);
            if (nodeEdges.length > 0) map[t.id] = nodeEdges.map((e: any) => ({ conditionLabel: e.conditionLabel, toNodeId: e.toNodeId }));
          });
          this.decisionEdges = map;
        });
      }
    });
  }

  complete(taskId: string, chosenEdgeLabel?: string) {
    this.http.post(`${API_BASE}/cases/tasks/${taskId}/complete`, { chosenEdgeLabel }).subscribe({
      next: () => { this.toast.show('Tarea completada', 'success'); this.load(); },
      error: () => this.toast.show('Error al completar tarea', 'error')
    });
  }

  assign(taskId: string, userId: string) {
    if (!userId) return;
    this.http.patch(`${API_BASE}/cases/tasks/${taskId}/assign`, { userId }).subscribe({
      next: () => { this.toast.show('Funcionario asignado', 'success'); this.load(); },
      error: () => this.toast.show('Error al asignar', 'error')
    });
  }

  cancel() {
    if (!confirm('¿Cancelar este trámite?')) return;
    this.http.patch(`${API_BASE}/cases/${this.id}/cancel`, {}).subscribe({
      next: () => { this.toast.show('Trámite cancelado', 'info'); this.load(); },
      error: () => this.toast.show('Error al cancelar', 'error')
    });
  }

  toggleForm(taskId: string) {
    this.expandedForms.has(taskId) ? this.expandedForms.delete(taskId) : this.expandedForms.add(taskId);
  }

  submitForm(taskId: string, data: Record<string, any>) {
    this.http.post(`${API_BASE}/forms/submit/${taskId}`, { payloadJson: data, inputMode: 'MANUAL' }).subscribe({
      next: () => { this.formSubmissions[taskId] = data; this.toast.show('Formulario guardado', 'success'); },
      error: () => this.toast.show('Error al guardar formulario', 'error')
    });
  }

  taskBadge(status: string) { return status === 'DONE' ? 'badge-green' : status === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'; }
}
