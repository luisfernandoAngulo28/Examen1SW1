import { Component, inject, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { API_BASE } from '../../api';

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

interface PolicySuggestion {
  policyId: string;
  policyName: string;
  confidence: number;
  explanation: string;
}

type Step = 'record' | 'analyzing' | 'suggestion' | 'confirming' | 'done';

@Component({
  selector: 'app-nuevo-proceso',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/" style="font-size:13px;display:inline-flex;align-items:center;gap:4px">← Inicio</a>
        <h1 style="margin-top:4px">Iniciar Nuevo Trámite</h1>
      </div>
    </div>

    <div class="page-body fade-in" style="max-width:680px;margin:0 auto">

      <!-- Stepper -->
      <div style="display:flex;gap:0;margin-bottom:32px;border-radius:8px;overflow:hidden;border:1px solid #e8e8e8">
        @for (s of steps; track s.key; let i = $index) {
          <div [style.flex]="1" [style.background]="step===s.key?'#1677ff':stepDone(s.key)?'#52c41a':'#fafafa'"
               [style.color]="step===s.key||stepDone(s.key)?'#fff':'#aaa'"
               style="padding:10px 8px;text-align:center;font-size:12px;font-weight:600;transition:background .2s">
            <div style="display:flex;justify-content:center;margin-bottom:2px">
              @switch (s.key) {
                @case ('record')     { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> }
                @case ('analyzing')  { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg> }
                @case ('suggestion') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
                @case ('confirming') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
                @case ('done')       { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> }
              }
            </div>
            <div>{{ s.label }}</div>
          </div>
        }
      </div>

      <!-- Step 1: Grabar voz -->
      @if (step === 'record') {
        <div class="card" style="padding:32px;text-align:center">
          <div style="margin-bottom:16px;display:flex;justify-content:center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </div>
          <h2 style="margin-bottom:8px">Describe tu situación</h2>
          <p style="color:var(--text-secondary);margin-bottom:24px;font-size:14px">
            Habla y describe qué trámite necesitas realizar. El sistema determinará
            automáticamente la política de negocio más apropiada para atenderte.
          </p>
          <p style="font-size:12px;color:#999;margin-bottom:24px">
            Ejemplo: <em>"Necesito solicitar la instalación de un medidor de luz en mi domicilio"</em>
          </p>

          <button (click)="toggleRecord()"
            [style.background]="recording ? '#ff4d4f' : '#1677ff'"
            style="color:#fff;border:none;border-radius:50%;width:80px;height:80px;font-size:28px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:all .2s;margin-bottom:20px"
            [title]="recording ? 'Detener grabación' : 'Iniciar grabación'">
            @if (recording) {
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            } @else {
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            }
          </button>

          @if (recording) {
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;color:#ff4d4f;font-weight:600;margin-bottom:16px">
              <span style="display:inline-block;width:10px;height:10px;background:#ff4d4f;border-radius:50%;animation:pulse 1s infinite"></span>
              Escuchando...
            </div>
          }

          @if (transcript) {
            <div style="background:#f6ffed;border:1px solid #b7eb8f;border-radius:8px;padding:14px;margin-bottom:20px;text-align:left">
              <div style="font-size:11px;font-weight:600;color:#52c41a;margin-bottom:4px">Transcripción detectada:</div>
              <div style="font-size:14px;font-style:italic;color:#333">"{{ transcript }}"</div>
            </div>
            <div style="display:flex;gap:10px;justify-content:center">
              <button (click)="clearTranscript()" class="btn btn-ghost">Volver a grabar</button>
              <button (click)="analyzePolicy()" class="btn btn-primary">
                Analizar con IA →
              </button>
            </div>
          }

          @if (voiceError) {
            <div style="color:#ff4d4f;font-size:13px;margin-top:12px">{{ voiceError }}</div>
          }
        </div>
      }

      <!-- Step 2: Analizando -->
      @if (step === 'analyzing') {
        <div class="card" style="padding:48px;text-align:center">
          <div class="spinner" style="margin:0 auto 20px"></div>
          <h3>Analizando tu solicitud...</h3>
          <p style="color:var(--text-secondary);font-size:14px">
            La IA está evaluando tu descripción para encontrar la política más apropiada.
          </p>
        </div>
      }

      <!-- Step 3: Sugerencia -->
      @if (step === 'suggestion' && suggestion) {
        <div class="card" style="padding:32px">
          <h2 style="margin-bottom:4px">Política sugerida</h2>
          <p style="color:var(--text-secondary);font-size:13px;margin-bottom:24px">
            Basado en tu descripción, la IA identificó la siguiente política:
          </p>

          <div style="background:linear-gradient(135deg,#e6f4ff,#f0f9ff);border:2px solid #91caff;border-radius:12px;padding:24px;margin-bottom:20px">
            <div style="display:flex;align-items:flex-start;gap:16px">
              <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:#e6f4ff;border-radius:8px;flex-shrink:0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div style="flex:1">
                <div style="font-size:20px;font-weight:700;color:#1677ff;margin-bottom:6px">
                  {{ suggestion.policyName }}
                </div>
                <div style="font-size:13px;color:#555;margin-bottom:12px">
                  {{ suggestion.explanation }}
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="flex:1;background:#e8e8e8;border-radius:4px;height:8px;overflow:hidden">
                    <div [style.width.%]="suggestion.confidence * 100"
                         [style.background]="suggestion.confidence >= 0.7 ? '#52c41a' : suggestion.confidence >= 0.4 ? '#faad14' : '#ff7875'"
                         style="height:100%;border-radius:4px;transition:width .5s"></div>
                  </div>
                  <span [style.color]="suggestion.confidence >= 0.7 ? '#52c41a' : suggestion.confidence >= 0.4 ? '#d48806' : '#cf1322'"
                        style="font-weight:700;font-size:13px;min-width:40px">
                    {{ (suggestion.confidence * 100) | number:'1.0-0' }}%
                  </span>
                </div>
                <div style="font-size:11px;color:#999;margin-top:4px">Confianza de la IA</div>
              </div>
            </div>
          </div>

          <div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;padding:12px;margin-bottom:24px;font-size:13px;color:#614700">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d48806" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <strong>Tu descripción:</strong> <em>"{{ transcript }}"</em>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button (click)="clearTranscript()" class="btn btn-ghost">
              ← Volver a describir
            </button>
            <button (click)="confirmAndStart()" class="btn btn-success" style="flex:1">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="display:inline;vertical-align:middle;margin-right:5px"><polyline points="20 6 9 17 4 12"/></svg>Confirmar e iniciar trámite
            </button>
          </div>
        </div>
      }

      <!-- Step 4: Confirmando -->
      @if (step === 'confirming') {
        <div class="card" style="padding:48px;text-align:center">
          <div class="spinner" style="margin:0 auto 20px"></div>
          <h3>Iniciando tu trámite...</h3>
        </div>
      }

      <!-- Step 5: Listo -->
      @if (step === 'done' && createdCaseId) {
        <div class="card" style="padding:48px;text-align:center">
          <div style="margin-bottom:16px;display:flex;justify-content:center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#52c41a" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 style="color:#52c41a;margin-bottom:8px">¡Trámite iniciado!</h2>
          <p style="color:var(--text-secondary);margin-bottom:8px">
            Se creó tu trámite con la política <strong>{{ suggestion?.policyName }}</strong>.
          </p>
          <p style="font-size:12px;color:#999;margin-bottom:28px">
            Recibirás notificaciones push sobre el avance de tu solicitud.
          </p>
          <div style="display:flex;gap:10px;justify-content:center">
            <a [routerLink]="['/cases', createdCaseId]" class="btn btn-primary">Ver mi trámite</a>
            <button (click)="restart()" class="btn btn-ghost">Iniciar otro</button>
          </div>
        </div>
      }

    </div>

    <style>
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
    </style>
  `
})
export class NuevoProcesComponent implements OnInit {
  step: Step = 'record';
  recording = false;
  transcript = '';
  voiceError = '';
  suggestion: PolicySuggestion | null = null;
  createdCaseId = '';

  readonly steps = [
    { key: 'record',     label: 'Describir' },
    { key: 'analyzing',  label: 'Analizar' },
    { key: 'suggestion', label: 'Sugerencia' },
    { key: 'confirming', label: 'Iniciar' },
    { key: 'done',       label: 'Listo' },
  ] as const;

  private recognition: any = null;
  private zone = inject(NgZone);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  ngOnInit() {}

  stepDone(key: string): boolean {
    const order = ['record', 'analyzing', 'suggestion', 'confirming', 'done'];
    return order.indexOf(this.step) > order.indexOf(key);
  }

  toggleRecord() {
    if (this.recording) {
      this.recognition?.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      this.voiceError = 'Reconocimiento de voz no soportado. Usa Chrome.';
      return;
    }
    this.voiceError = '';
    this.transcript = '';
    const r = new SR();
    r.lang = 'es-ES';
    r.interimResults = false;
    r.maxAlternatives = 1;
    this.recognition = r;
    this.recording = true;

    r.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      this.zone.run(() => { this.transcript = text; this.recording = false; });
    };
    r.onerror = (e: any) => this.zone.run(() => {
      this.voiceError = 'Error de voz: ' + e.error + '. Revisa permisos de micrófono.';
      this.recording = false;
    });
    r.onend = () => this.zone.run(() => { this.recording = false; });
    r.start();
  }

  clearTranscript() {
    this.transcript = '';
    this.voiceError = '';
    this.suggestion = null;
    this.step = 'record';
  }

  analyzePolicy() {
    if (!this.transcript.trim()) return;
    this.step = 'analyzing';
    this.http.post<PolicySuggestion>(
      `${API_BASE}/ai-assistant/suggest-policy`,
      { transcript: this.transcript }
    ).subscribe({
      next: (res) => this.zone.run(() => {
        this.suggestion = res;
        this.step = 'suggestion';
      }),
      error: () => this.zone.run(() => {
        this.toast.show('Error al analizar la solicitud. Intenta de nuevo.', 'error');
        this.step = 'record';
      }),
    });
  }

  confirmAndStart() {
    if (!this.suggestion?.policyId) return;
    this.step = 'confirming';
    this.http.post<any>(
      `${API_BASE}/cases`,
      { policyId: this.suggestion.policyId }
    ).subscribe({
      next: (res) => this.zone.run(() => {
        this.createdCaseId = res.id;
        this.step = 'done';
        this.toast.show('¡Trámite iniciado exitosamente!', 'success');
      }),
      error: () => this.zone.run(() => {
        this.toast.show('Error al iniciar el trámite. Intenta de nuevo.', 'error');
        this.step = 'suggestion';
      }),
    });
  }

  restart() {
    this.step = 'record';
    this.transcript = '';
    this.voiceError = '';
    this.suggestion = null;
    this.createdCaseId = '';
  }
}
