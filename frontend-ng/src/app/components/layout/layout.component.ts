import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Client } from '@stomp/stompjs';
import { API_BASE } from '../../api';

const WS_BASE = API_BASE.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Workflow<span>SW1</span>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section">Principal</div>

          <!-- OFFICER: su bandeja de tareas -->
          @if (user?.role === 'OFFICER') {
            <a routerLink="/my-tasks" routerLinkActive="active" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Mi Bandeja
            </a>
          }

          <!-- CLIENT: dashboard + agente + mis trámites -->
          @if (user?.role === 'CLIENT') {
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
            <a routerLink="/agent" routerLinkActive="active" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
              Iniciar Trámite
            </a>
            <a routerLink="/my-cases" routerLinkActive="active" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Mis Trámites
            </a>
          }

          <!-- ADMIN / DESIGNER: dashboard completo -->
          @if (user?.role === 'ADMIN' || user?.role === 'DESIGNER') {
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
            <a routerLink="/departments" routerLinkActive="active" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Departamentos
            </a>
          }

          <a routerLink="/monitor" routerLinkActive="active" class="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
            Monitor en Vivo
          </a>
          @if (user?.role !== 'CLIENT') {
            <a routerLink="/analytics" routerLinkActive="active" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Analytics
            </a>
          }
          @if (user?.role === 'ADMIN' || user?.role === 'DESIGNER') {
            <a routerLink="/reports" routerLinkActive="active" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Reportes IA
            </a>
          }

          @if (user?.role === 'ADMIN' || user?.role === 'DESIGNER') {
            <div class="sidebar-section">Gestión</div>
            <a routerLink="/policies/new" routerLinkActive="active" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva Política
            </a>
            <a routerLink="/register" routerLinkActive="active" class="sidebar-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Registrar Usuario
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <!-- Notificaciones -->
          <div style="position:relative;margin-bottom:10px">
            <button (click)="toggleNotif()" style="width:100%;padding:8px 12px;background:rgba(255,255,255,.04);color:#8896ab;border:1px solid rgba(255,255,255,.08);border-radius:10px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px;justify-content:space-between">
              <div style="display:flex;align-items:center;gap:8px">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Notificaciones
              </div>
              @if (unreadCount > 0) {
                <span style="background:#ff4d4f;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              }
            </button>
            @if (notifOpen) {
              <div style="position:absolute;bottom:44px;left:0;right:0;background:#1e2433;border:1px solid rgba(255,255,255,.1);border-radius:12px;max-height:260px;overflow-y:auto;z-index:100;box-shadow:0 8px 32px rgba(0,0,0,.4)">
                <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#fff;font-size:13px;font-weight:600">Actividad reciente</span>
                  <button (click)="clearNotifs()" style="background:none;border:none;color:#8896ab;cursor:pointer;font-size:11px">Limpiar</button>
                </div>
                @if (notifications.length === 0) {
                  <div style="padding:20px;text-align:center;color:#8896ab;font-size:12px">Sin notificaciones</div>
                }
                @for (n of notifications; track $index) {
                  <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);display:flex;gap:8px;align-items:flex-start">
                    <span style="font-size:16px">{{ n.icon }}</span>
                    <div>
                      <div style="color:#e2e8f0;font-size:12px">{{ n.text }}</div>
                      <div style="color:#8896ab;font-size:10px;margin-top:2px">{{ n.time }}</div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="user-info">
            <div class="avatar">{{ user?.name?.charAt(0)?.toUpperCase() }}</div>
            <div>
              <div class="user-name">{{ user?.name }}</div>
              <div class="user-role">{{ user?.role }}</div>
            </div>
          </div>
          <button (click)="logout()" style="margin-top:14px;width:100%;padding:9px 12px;background:rgba(255,255,255,.04);color:#8896ab;border:1px solid rgba(255,255,255,.08);border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `
})
export class LayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  notifications: { icon: string; text: string; time: string }[] = [];
  unreadCount = 0;
  notifOpen = false;
  private ws?: Client;

  get user() { return this.auth.user(); }
  logout() { this.auth.logout(); }

  ngOnInit() {
    this.ws = new Client({
      brokerURL: `${WS_BASE}/ws/websocket`,
      reconnectDelay: 5000,
      onConnect: () => {
        this.ws!.subscribe('/topic/events', (msg) => {
          const p = JSON.parse(msg.body);
          const iconMap: Record<string, string> = { 'task:completed': '✅', 'task:assigned': '👤', 'case:completed': '🎉', 'case:cancelled': '❌', 'task:created': '🆕' };
          const textMap: Record<string, string> = {
            'task:completed': 'Tarea completada',
            'task:assigned': 'Tarea asignada',
            'case:completed': 'Trámite completado',
            'case:cancelled': 'Trámite cancelado',
            'task:created': 'Nueva tarea creada',
          };
          if (iconMap[p.type]) {
            const now = new Date();
            const time = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
            this.notifications.unshift({ icon: iconMap[p.type], text: textMap[p.type] || p.type, time });
            if (this.notifications.length > 20) this.notifications.pop();
            if (!this.notifOpen) this.unreadCount++;
          }
        });
      },
    });
    this.ws.activate();
  }

  ngOnDestroy() { this.ws?.deactivate(); }

  toggleNotif() {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) this.unreadCount = 0;
  }

  clearNotifs() { this.notifications = []; this.unreadCount = 0; }
}
