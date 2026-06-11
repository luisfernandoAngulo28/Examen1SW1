import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  node: { id: string; title: string; nodeType?: string; department: Department; voiceEnabled?: boolean; slaHours?: number | null };
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
            <button (click)="cancel()" class="btn btn-danger" style="display:inline-flex;align-items:center;gap:4px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Cancelar trámite
          </button>
          }
        </div>
      </div>

      <!-- ══ Progress bar del trámite ══════════════════════════════════════════ -->
      <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:13px;font-weight:600;color:var(--text-primary)">Progreso del trámite</span>
          <span style="font-size:13px;font-weight:700;color:{{ progressPct === 100 ? '#52c41a' : '#1677ff' }}">
            {{ doneTasks }}/{{ totalTasks }} tareas · {{ progressPct }}%
          </span>
        </div>
        <div style="height:10px;background:var(--border);border-radius:10px;overflow:hidden">
          <div [style.width]="progressPct + '%'"
               [style.background]="progressPct === 100 ? '#52c41a' : 'linear-gradient(90deg,#1677ff,#722ed1)'"
               style="height:100%;border-radius:10px;transition:width .5s ease"></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:8px;font-size:11px;color:var(--text-secondary)">
          <span style="display:inline-flex;align-items:center;gap:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#52c41a"></span>{{ doneTasks }} completadas</span>
          <span style="display:inline-flex;align-items:center;gap:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#faad14"></span>{{ inProgressTasks }} en progreso</span>
          <span style="display:inline-flex;align-items:center;gap:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff4d4f"></span>{{ pendingTasks }} pendientes</span>
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
                      <span style="font-size:13px;color:var(--text-secondary);font-weight:600;display:inline-flex;align-items:center;gap:4px">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                        Decidir:
                      </span>
                      @for (de of (decisionEdges[task.id] || []); track de.conditionLabel) {
                        <button (click)="complete(task.id, de.conditionLabel)" class="btn btn-warning btn-sm" style="color:#fff">{{ de.conditionLabel }}</button>
                      }
                    </div>
                  } @else {
                    <button (click)="complete(task.id)" class="btn btn-success btn-sm" style="display:inline-flex;align-items:center;gap:4px">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Completar
                    </button>
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
                    @if (formSubmissions[task.id]) {
                      <span class="badge badge-green" style="margin-left:8px;display:inline-flex;align-items:center;gap:2px">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    }
                  </button>
                  @if (expandedForms.has(task.id)) {
                    <app-dynamic-form
                      [schema]="formTemplates[task.node.id]"
                      [initial]="formSubmissions[task.id]"
                      [voiceEnabled]="task.node.voiceEnabled !== false"
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

    <!-- ══ Chat flotante del caso ═══════════════════════════════════════════ -->
    <div style="position:fixed;bottom:24px;right:24px;z-index:1000">
      @if (!chatOpen) {
        <button (click)="chatOpen=true" title="Chat del caso"
                style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#722ed1,#1677ff);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(114,46,209,.4);display:flex;align-items:center;justify-content:center;position:relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          @if (chatMessages.length > 0) {
            <span style="position:absolute;top:-4px;right:-4px;background:#ff4d4f;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">
              {{ chatMessages.length > 9 ? '9+' : chatMessages.length }}
            </span>
          }
        </button>
      } @else {
        <div style="width:320px;height:420px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden">
          <div style="background:linear-gradient(135deg,#722ed1,#1677ff);padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="color:#fff;font-weight:700;font-size:14px">Chat del trámite</div>
              <div style="color:rgba(255,255,255,.7);font-size:11px">{{ chatMessages.length }} mensajes</div>
            </div>
            <button (click)="chatOpen=false" style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;line-height:1">×</button>
          </div>
          <div #chatScroll style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f8f9fa">
            @if (chatMessages.length === 0) {
              <div style="text-align:center;color:#999;font-size:12px;margin-top:40px;display:flex;flex-direction:column;align-items:center;gap:6px">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Sé el primero en escribir
              </div>
            }
            @for (m of chatMessages; track $index) {
              <div [style.align-self]="m.userId === myChatUserId ? 'flex-end' : 'flex-start'"
                   style="max-width:85%">
                <div style="font-size:10px;color:#999;margin-bottom:2px;padding:0 4px">{{ m.userName }}</div>
                <div [style.background]="m.userId === myChatUserId ? '#722ed1' : '#fff'"
                     [style.color]="m.userId === myChatUserId ? '#fff' : '#333'"
                     style="padding:8px 12px;border-radius:12px;font-size:13px;box-shadow:0 1px 4px rgba(0,0,0,.1)">
                  {{ m.content }}
                </div>
              </div>
            }
          </div>
          <div style="padding:10px;border-top:1px solid #eee;display:flex;gap:8px;background:#fff">
            <input #chatInput [(ngModel)]="chatText" (keyup.enter)="sendChat()"
                   placeholder="Escribe un mensaje..."
                   style="flex:1;border:1px solid #ddd;border-radius:20px;padding:7px 14px;font-size:13px;outline:none" />
            <button (click)="sendChat()" [disabled]="!chatText.trim()"
                    style="background:#722ed1;color:#fff;border:none;border-radius:50%;width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      }
    </div>

    <!-- ══ Motor Inteligente de Enrutamiento — Risk Warning Modal ═══════════ -->
    @if (riskWarning) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1500;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:16px;padding:32px;max-width:480px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3)">
          <div style="display:flex;justify-content:center;margin-bottom:8px">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h2 style="color:#ff4d4f;text-align:center;margin:0 0 8px">Riesgo Detectado por IA</h2>
          <p style="color:#666;text-align:center;font-size:14px;margin-bottom:20px">
            El <strong>Motor Inteligente de Enrutamiento</strong> (ML/TensorFlow) detectó probabilidad de demora en este trámite. Nivel: <strong style="color:#ff4d4f">{{ riskWarning.risk_level || 'MEDIO' }}</strong>
          </p>
          <div style="background:#fff2f0;border:1px solid #ffccc7;border-radius:8px;padding:14px;margin-bottom:20px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:13px;color:#666">Puntuación de riesgo:</span>
              <span style="font-size:13px;font-weight:700;color:#ff4d4f">{{ ((riskWarning.risk_score || 0.85) * 100).toFixed(0) }}%</span>
            </div>
            <div style="font-size:12px;color:#cf1322">
              <strong>Recomendación IA:</strong> {{ riskWarning.recommendation || 'Revisar la carga de trabajo del departamento antes de continuar.' }}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <button (click)="riskWarning=null;pendingCompletion=null"
                    style="background:#fff;color:#666;border:1px solid #d9d9d9;border-radius:8px;padding:10px;font-size:13px;cursor:pointer;font-weight:600">
              ← Cancelar y revisar
            </button>
            <button (click)="confirmCompletion()"
                    style="background:#ff4d4f;color:#fff;border:none;border-radius:8px;padding:10px;font-size:13px;cursor:pointer;font-weight:600">
              Avanzar de todas formas →
            </button>
          </div>
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
  riskWarning: any = null;
  pendingCompletion: { taskId: string; chosenEdgeLabel?: string } | null = null;
  chatOpen = false;
  chatText = '';
  chatMessages: { userId: string; userName: string; color: string; content: string }[] = [];
  myChatUserId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  @ViewChild('chatScroll') chatScrollEl?: ElementRef;

  readonly statusColor: Record<string, string> = { PENDING: '#999', IN_PROGRESS: '#fa8c16', DONE: '#52c41a', BLOCKED: '#ff4d4f' };
  private id = '';
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private stompClient?: Client;

  get visibleTasks() {
    return (this.caseData?.tasks || []).filter(t => !['INITIAL', 'FORK', 'JOIN', 'FINAL'].includes(t.node.nodeType || 'ACTION'));
  }

  get doneTasks() { return (this.caseData?.tasks || []).filter(t => t.status === 'DONE').length; }
  get inProgressTasks() { return (this.caseData?.tasks || []).filter(t => t.status === 'IN_PROGRESS').length; }
  get pendingTasks() { return (this.caseData?.tasks || []).filter(t => t.status === 'PENDING').length; }
  get totalTasks() { return Math.max(this.caseData?.tasks.length || 1, 1); }
  get progressPct() { return Math.round((this.doneTasks / this.totalTasks) * 100); }

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
        // Chat del caso en tiempo real
        this.stompClient!.subscribe(`/topic/document/case-${this.id}/notes`, (msg) => {
          const note = JSON.parse(msg.body);
          this.chatMessages.push({ userId: note.userId, userName: note.userName, color: note.color, content: note.content });
          setTimeout(() => {
            const el = this.chatScrollEl?.nativeElement;
            if (el) el.scrollTop = el.scrollHeight;
          }, 50);
        });
      },
      onDisconnect: () => this.wsConnected = false,
    });
    this.stompClient.activate();
  }

  sendChat() {
    if (!this.chatText.trim() || !this.stompClient?.connected) return;
    const myName = this._getMyChatName();
    this.stompClient.publish({
      destination: `/app/document/case-${this.id}/note`,
      body: JSON.stringify({ userId: this.myChatUserId, userName: myName, color: '#722ed1', content: this.chatText.trim() }),
    });
    this.chatText = '';
  }

  private _getMyChatName(): string {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      if (token) { const p = JSON.parse(atob(token.split('.')[1])); return p.name || p.sub || 'Usuario'; }
    } catch { }
    return 'Usuario';
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
    // Motor Inteligente de Enrutamiento: consultar ML antes de avanzar
    this.http.get<any>(`${API_BASE}/ml/dashboard`).subscribe({
      next: dashboard => {
        const riskItem = (dashboard.delayRisk || []).find((r: any) => r.case_id === this.id);
        const isRisky = riskItem && (riskItem.risk_level === 'HIGH' || riskItem.risk_level === 'MEDIUM' || (riskItem.risk_score || 0) > 0.20);
        if (isRisky) {
          this.riskWarning = riskItem;
          this.pendingCompletion = { taskId, chosenEdgeLabel };
        } else {
          this.doComplete(taskId, chosenEdgeLabel);
        }
      },
      error: () => this.doComplete(taskId, chosenEdgeLabel)
    });
  }

  confirmCompletion() {
    if (this.pendingCompletion) {
      this.doComplete(this.pendingCompletion.taskId, this.pendingCompletion.chosenEdgeLabel);
      this.riskWarning = null;
      this.pendingCompletion = null;
    }
  }

  private doComplete(taskId: string, chosenEdgeLabel?: string) {
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
