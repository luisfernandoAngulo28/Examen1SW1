import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import { TrafficLightComponent } from '../../components/traffic-light/traffic-light.component';
import { API_BASE } from '../../api';

const WS_BASE = API_BASE.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');

interface LiveEvent { id: string; type: string; data: any; timestamp: Date; }
interface LiveCase { id: string; status: string; policy: { id: string; name: string }; tasks: { id: string; status: string; node: { title: string } }[]; }

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, RouterLink, TrafficLightComponent],
  template: `
    <div class="page-header">
      <h1>Monitor en Vivo</h1>
      <span class="badge" [class]="connected ? 'badge-green' : 'badge-red'" style="font-size:12px;padding:4px 10px">
        {{ connected ? '● Conectado' : '○ Desconectado' }}
      </span>
    </div>
    <div class="page-body fade-in">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <!-- Active Cases -->
        <div>
          <h2 style="font-size:15px;font-weight:700;margin-bottom:12px">Trámites Activos ({{ activeCases.length }})</h2>
          @if (loading) {
            <div style="text-align:center;padding:24px;color:var(--text-secondary)">Cargando...</div>
          } @else {
            @for (c of activeCases; track c.id) {
              <div class="card" style="padding:14px;margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <span style="font-weight:600;font-size:14px">{{ c.policy.name }}</span>
                  <app-traffic-light [status]="c.status" [showLabel]="true" />
                </div>
                <div style="font-size:11px;color:var(--text-secondary);font-family:monospace;margin-bottom:8px">{{ c.id | slice:0:16 }}...</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px">
                  @for (t of c.tasks.slice(0,4); track t.id) {
                    <span [class]="'badge ' + taskBadge(t.status)" style="font-size:10px">{{ t.node.title | slice:0:14 }}</span>
                  }
                </div>
                <a [routerLink]="['/cases', c.id]" class="btn btn-primary btn-sm" style="margin-top:8px;display:inline-block">Ver detalle →</a>
              </div>
            }
            @empty {
              <div style="text-align:center;padding:24px;color:var(--text-secondary)">No hay trámites activos</div>
            }
          }
        </div>

        <!-- Event Feed -->
        <div>
          <h2 style="font-size:15px;font-weight:700;margin-bottom:12px">Feed de Eventos</h2>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:600px;overflow-y:auto">
            @for (ev of events; track ev.id) {
              <div class="card" style="padding:10px 14px;border-left:4px solid {{ eventColor(ev.type) }}">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span class="badge badge-blue" style="font-size:11px">{{ ev.type }}</span>
                  <span style="font-size:11px;color:var(--text-secondary)">{{ ev.timestamp | date:'HH:mm:ss' }}</span>
                </div>
                @if (ev.data?.caseId) {
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Trámite: {{ ev.data.caseId | slice:0:8 }}...</div>
                }
              </div>
            }
            @empty {
              <div style="text-align:center;padding:24px;color:var(--text-secondary)">Esperando eventos...</div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonitorComponent implements OnInit, OnDestroy {
  activeCases: LiveCase[] = [];
  events: LiveEvent[] = [];
  connected = false;
  loading = true;
  private stompClient?: Client;
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<LiveCase[]>(`${API_BASE}/cases`).subscribe({
      next: (all) => { this.activeCases = all.filter(c => c.status === 'IN_PROGRESS' || c.status === 'OPEN'); this.loading = false; },
      error: () => this.loading = false
    });
    this.connectStomp();
  }

  ngOnDestroy() { this.stompClient?.deactivate(); }

  connectStomp() {
    this.stompClient = new Client({
      brokerURL: `${WS_BASE}/ws/websocket`,
      reconnectDelay: 3000,
      onConnect: () => {
        this.connected = true;
        this.stompClient!.subscribe('/topic/events', (msg) => {
          const payload = JSON.parse(msg.body);
          const ev: LiveEvent = { id: Date.now().toString(), type: payload.type, data: payload.data, timestamp: new Date() };
          this.events = [ev, ...this.events.slice(0, 49)];
          if (['case:started', 'task:completed', 'task:assigned', 'case:completed', 'case:cancelled'].includes(payload.type)) {
            this.http.get<LiveCase[]>(`${API_BASE}/cases`).subscribe(all => { this.activeCases = all.filter(c => c.status === 'IN_PROGRESS' || c.status === 'OPEN'); });
          }
        });
      },
      onDisconnect: () => this.connected = false,
    });
    this.stompClient.activate();
  }

  taskBadge(s: string) { return s === 'DONE' ? 'badge-green' : s === 'IN_PROGRESS' ? 'badge-orange' : 'badge-gray'; }
  eventColor(type: string) {
    const map: Record<string, string> = { 'case:started': '#1677ff', 'task:completed': '#52c41a', 'task:assigned': '#722ed1', 'case:completed': '#13c2c2', 'case:cancelled': '#ff4d4f' };
    return map[type] || '#999';
  }
}
