import { Component, inject, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { API_BASE } from '../../api';

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AgentResponse {
  sessionId: string;
  reply: string;
  phase: string;
  nextAction: string;
  matchedPolicy: { id: string; name: string } | null;
  extra?: any;
}

@Component({
  selector: 'app-agent-intake',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/" style="font-size:13px">← Dashboard</a>
        <h1 style="margin-top:4px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#722ed1" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:8px"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
          Asistente de Trámites
        </h1>
      </div>
      @if (matchedPolicy) {
        <div style="display:flex;align-items:center;gap:8px;background:#f9f0ff;border:1px solid #d3adf7;border-radius:8px;padding:8px 14px">
          <span style="font-size:12px;color:#531dab;font-weight:600">Trámite identificado:</span>
          <span style="font-size:13px;font-weight:700;color:#722ed1">{{ matchedPolicy.name }}</span>
        </div>
      }
    </div>

    <div class="page-body fade-in" style="max-width:760px;margin:0 auto">

      <!-- Progress indicator -->
      @if (phase !== 'GREETING' && phase !== 'DONE') {
        <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
          @for (step of phases; track step.key) {
            <div style="display:flex;align-items:center;gap:6px">
              <div [style.background]="isStepDone(step.key) ? '#52c41a' : isCurrentStep(step.key) ? '#722ed1' : '#f0f0f0'"
                   [style.color]="isStepDone(step.key) || isCurrentStep(step.key) ? '#fff' : '#bbb'"
                   style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">
                {{ isStepDone(step.key) ? '✓' : step.num }}
              </div>
              <span [style.color]="isCurrentStep(step.key) ? '#722ed1' : '#999'" style="font-size:12px;font-weight:500">{{ step.label }}</span>
              @if (!$last) { <div style="flex:1;height:1px;background:#e8e8e8;min-width:20px;margin-left:6px"></div> }
            </div>
          }
        </div>
      }

      <!-- Chat window -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px">

        <!-- Chat header -->
        <div style="background:linear-gradient(135deg,#722ed1,#a855f7);padding:14px 20px;display:flex;align-items:center;gap:10px">
          <div style="width:38px;height:38px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px">🤖</div>
          <div>
            <div style="color:#fff;font-weight:700;font-size:14px">Agente Virtual de Trámites</div>
            <div style="color:rgba(255,255,255,.7);font-size:11px">Powered by IA · Siempre disponible</div>
          </div>
          <div style="flex:1"></div>
          @if (phase !== 'GREETING') {
            <button (click)="resetSession()" style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer">
              ↺ Reiniciar
            </button>
          }
        </div>

        <!-- Messages -->
        <div #chatContainer style="height:420px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#fafafa">
          @for (msg of messages; track $index) {
            <div [style.align-self]="msg.role === 'user' ? 'flex-end' : 'flex-start'"
                 style="max-width:78%">
              @if (msg.role === 'agent') {
                <div style="display:flex;align-items:flex-start;gap:8px">
                  <div style="width:30px;height:30px;background:#722ed1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:2px">🤖</div>
                  <div>
                    <div style="background:#fff;border:1px solid #e8e8e8;border-radius:0 12px 12px 12px;padding:10px 14px;font-size:13px;line-height:1.6;white-space:pre-wrap">{{ msg.content }}</div>
                    <div style="font-size:10px;color:#bbb;margin-top:3px;margin-left:4px">{{ msg.timestamp | date:'HH:mm' }}</div>
                  </div>
                </div>
              } @else {
                <div>
                  <div style="background:#722ed1;color:#fff;border-radius:12px 0 12px 12px;padding:10px 14px;font-size:13px;line-height:1.6">{{ msg.content }}</div>
                  <div style="font-size:10px;color:#bbb;margin-top:3px;text-align:right;margin-right:4px">{{ msg.timestamp | date:'HH:mm' }}</div>
                </div>
              }
            </div>
          }
          @if (thinking) {
            <div style="align-self:flex-start;display:flex;align-items:center;gap:8px">
              <div style="width:30px;height:30px;background:#722ed1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px">🤖</div>
              <div style="background:#fff;border:1px solid #e8e8e8;border-radius:0 12px 12px 12px;padding:10px 14px">
                <span style="display:inline-flex;gap:3px">
                  <span style="width:6px;height:6px;background:#bbb;border-radius:50%;animation:bounce .8s infinite"></span>
                  <span style="width:6px;height:6px;background:#bbb;border-radius:50%;animation:bounce .8s .15s infinite"></span>
                  <span style="width:6px;height:6px;background:#bbb;border-radius:50%;animation:bounce .8s .3s infinite"></span>
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Input area -->
        <div style="border-top:1px solid var(--border);padding:12px 16px;background:#fff">

          <!-- Upload zone (when in REQUIREMENTS phase) -->
          @if (nextAction === 'UPLOAD_DOCUMENT') {
            <div style="background:#fffbe6;border:1px dashed #faad14;border-radius:8px;padding:12px;margin-bottom:10px;text-align:center">
              <div style="font-size:12px;color:#d48806;margin-bottom:8px">
                📎 Sube el documento: <strong>{{ currentRequirement?.name }}</strong>
                @if (currentRequirement?.description) { <span style="color:#999"> — {{ currentRequirement?.description }}</span> }
              </div>
              <label style="background:#faad14;color:#fff;border-radius:6px;padding:6px 16px;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                📂 Seleccionar archivo
                <input type="file" style="display:none" (change)="onDocumentSelected($event)" />
              </label>
              @if (!currentRequirement?.required) {
                <button (click)="skipRequirement()" style="margin-left:10px;background:none;color:#999;border:1px solid #ddd;border-radius:6px;padding:6px 14px;font-size:12px;cursor:pointer">
                  Omitir (opcional)
                </button>
              }
            </div>
          }

          <!-- Confirm buttons -->
          @if (nextAction === 'CONFIRM') {
            <div style="display:flex;gap:8px;margin-bottom:10px">
              <button (click)="sendMessage('Sí, confirmo el inicio')" class="btn btn-primary" style="flex:1">
                ✅ Confirmar e iniciar trámite
              </button>
              <button (click)="sendMessage('No, cancelar')" class="btn btn-ghost" style="flex:1">
                ✗ Cancelar
              </button>
            </div>
          }

          <!-- Text input (always visible) -->
          @if (nextAction !== 'DONE') {
            <div style="display:flex;gap:8px">
              <input type="text" [(ngModel)]="inputText" class="form-input"
                placeholder="Escribe tu mensaje aquí..."
                style="flex:1;font-size:14px"
                (keyup.enter)="sendMessage()" />
              <button (click)="toggleVoice()"
                [style.background]="listening ? '#ff4d4f' : 'var(--bg-secondary)'"
                [style.color]="listening ? '#fff' : 'var(--text-secondary)'"
                style="padding:0 12px;border-radius:8px;border:1px solid var(--border);cursor:pointer;font-size:18px"
                title="Dictado por voz">
                {{ listening ? '⏹' : '🎤' }}
              </button>
              <button (click)="sendMessage()" [disabled]="thinking || (!inputText.trim() && nextAction !== 'CONFIRM')"
                class="btn btn-primary" style="min-width:80px">
                Enviar
              </button>
            </div>
          } @else {
            <div style="text-align:center">
              <a routerLink="/my-cases" class="btn btn-primary">📂 Ver mis trámites</a>
            </div>
          }
        </div>
      </div>
    </div>

    <style>
      @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
    </style>
  `
})
export class AgentIntakeComponent implements OnInit {
  messages: ChatMessage[] = [];
  inputText = '';
  thinking = false;
  listening = false;
  sessionId = '';
  phase = 'GREETING';
  nextAction = 'AWAIT_INPUT';
  matchedPolicy: { id: string; name: string } | null = null;
  currentRequirement: any = null;

  readonly phases = [
    { key: 'GREETING',     num: '1', label: 'Descripción' },
    { key: 'REQUIREMENTS', num: '2', label: 'Documentos' },
    { key: 'CONFIRM',      num: '3', label: 'Confirmación' },
    { key: 'DONE',         num: '4', label: 'Completado' },
  ];

  private http = inject(HttpClient);
  private zone = inject(NgZone);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);
  private recognition: any = null;

  ngOnInit() {
    this.sessionId = crypto.randomUUID();
    // Trigger greeting
    setTimeout(() => this.chat(''), 300);
  }

  sendMessage(text?: string) {
    const msg = (text ?? this.inputText).trim();
    if (!msg && this.nextAction !== 'UPLOAD_DOCUMENT') return;
    if (msg) {
      this.messages.push({ role: 'user', content: msg, timestamp: new Date() });
      this.inputText = '';
    }
    this.chat(msg);
  }

  skipRequirement() {
    this.messages.push({ role: 'user', content: '(Documento omitido)', timestamp: new Date() });
    this.chat('omitir');
  }

  private chat(message: string) {
    this.thinking = true;
    this.http.post<AgentResponse>(`${API_BASE}/agent/chat`, {
      sessionId: this.sessionId, message
    }).subscribe({
      next: res => this.zone.run(() => {
        this.thinking = false;
        this.messages.push({ role: 'agent', content: res.reply, timestamp: new Date() });
        this.phase = res.phase;
        this.nextAction = res.nextAction;
        if (res.matchedPolicy) this.matchedPolicy = res.matchedPolicy;
        if (res.extra?.requirement) this.currentRequirement = res.extra.requirement;
        this.scrollToBottom();
      }),
      error: () => this.zone.run(() => {
        this.thinking = false;
        this.messages.push({ role: 'agent', content: 'Hubo un error de conexión. Por favor intenta de nuevo.', timestamp: new Date() });
      })
    });
  }

  onDocumentSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.messages.push({ role: 'user', content: `📎 Documento adjuntado: ${file.name}`, timestamp: new Date() });
    // After "uploading" notify agent to advance
    this.chat(`Adjunté el documento: ${file.name}`);
  }

  toggleVoice() {
    if (this.listening) { this.recognition?.stop(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { this.toast.show('Reconocimiento de voz no disponible en este navegador', 'error'); return; }
    const r = new SR();
    r.lang = 'es-ES'; r.interimResults = false;
    this.recognition = r;
    this.listening = true;
    r.onresult = (e: any) => this.zone.run(() => {
      this.inputText = e.results[0][0].transcript;
      this.listening = false;
      this.sendMessage();
    });
    r.onerror = () => this.zone.run(() => { this.listening = false; });
    r.onend  = () => this.zone.run(() => { this.listening = false; });
    r.start();
  }

  resetSession() {
    this.sessionId = crypto.randomUUID();
    this.messages = [];
    this.phase = 'GREETING';
    this.nextAction = 'AWAIT_INPUT';
    this.matchedPolicy = null;
    this.currentRequirement = null;
    setTimeout(() => this.chat(''), 100);
  }

  isStepDone(key: string): boolean {
    const order = ['GREETING', 'REQUIREMENTS', 'CONFIRM', 'DONE'];
    return order.indexOf(this.phase) > order.indexOf(key);
  }
  isCurrentStep(key: string): boolean { return this.phase === key; }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('[style*="height:420px"]');
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);
  }
}
