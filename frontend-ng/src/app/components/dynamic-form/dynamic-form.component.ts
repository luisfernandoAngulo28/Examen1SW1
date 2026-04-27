import { Component, Input, Output, EventEmitter, NgZone, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../api';

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: string[];
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <!-- Barra de dictado holístico NLP -->
    <div style="background:linear-gradient(135deg,#e6f4ff,#f0f9ff);border:1px solid #91caff;border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;font-weight:600;color:#1677ff">🧠 Dictado inteligente (NLP)</span>
        <button type="button" (click)="startDictateAll()"
          [disabled]="dictateLoading"
          [style.background]="dictating ? '#ff4d4f' : '#1677ff'"
          style="color:#fff;border:none;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;font-weight:600">
          {{ dictating ? '🔴 Escuchando...' : dictateLoading ? '⏳ Procesando...' : '🎙️ Dictar todo' }}
        </button>
        <span style="font-size:11px;color:#666">Describe todos los datos en una sola frase</span>
      </div>
      @if (nlpTranscript) {
        <div style="font-size:11px;color:#555;font-style:italic;background:#fff;padding:4px 8px;border-radius:4px;border-left:3px solid #1677ff">
          "{{ nlpTranscript }}"
        </div>
      }
    </div>

    <div class="dynamic-form-grid">
      @for (field of fields; track field.name) {
        <div class="dynamic-form-field" [class.full-width]="field.type === 'textarea'">
          <label class="form-label" style="display:flex;align-items:center;gap:6px">
            {{ field.label }}{{ field.required ? ' *' : '' }}
            @if (confidenceMap[field.name] > 0) {
              <span [style.background]="confidenceMap[field.name] >= 0.8 ? '#52c41a' : confidenceMap[field.name] >= 0.6 ? '#faad14' : '#ff7875'"
                style="display:inline-block;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;color:#fff"
                [title]="'Confianza NLP: ' + (confidenceMap[field.name] * 100 | number:'1.0-0') + '%'">
                {{ (confidenceMap[field.name] * 100 | number:'1.0-0') + '%' }}
              </span>
            }
          </label>
          @if (field.type === 'textarea') {
            <div style="position:relative">
              <textarea class="form-input" [(ngModel)]="values[field.name]" [required]="!!field.required" style="padding-right:36px"></textarea>
              <button type="button" (click)="voiceInput(field.name)"
                [style.color]="listeningField === field.name ? '#ff4d4f' : 'var(--text-secondary)'"
                style="position:absolute;right:6px;top:6px;background:none;border:none;cursor:pointer;font-size:16px"
                title="Dictar por voz">{{ listeningField === field.name ? '🔴' : '🎤' }}</button>
            </div>
          } @else if (field.type === 'select') {
            <select class="form-select" style="width:100%" [(ngModel)]="values[field.name]">
              <option value="">Seleccionar...</option>
              @for (opt of field.options; track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
          } @else if (field.type === 'text') {
            <div style="display:flex;gap:4px">
              <input type="text" class="form-input" [(ngModel)]="values[field.name]" [required]="!!field.required" style="flex:1" />
              <button type="button" (click)="voiceInput(field.name)"
                [style.color]="listeningField === field.name ? '#ff4d4f' : 'var(--text-secondary)'"
                class="btn btn-ghost btn-sm" title="Dictar campo">
                {{ listeningField === field.name ? '🔴' : '🎤' }}
              </button>
            </div>
          } @else {
            <input [type]="field.type" class="form-input" [(ngModel)]="values[field.name]" [required]="!!field.required" />
          }
        </div>
      }
    </div>
    <div style="margin-top:14px;display:flex;gap:8px;align-items:center">
      <button type="button" class="btn btn-success btn-sm" (click)="onSubmit()">Guardar Formulario</button>
      @if (voiceError) { <span style="font-size:11px;color:var(--danger)">{{ voiceError }}</span> }
    </div>
  `
})
export class DynamicFormComponent {
  @Input() set schema(s: any) { this.fields = this._parseSchema(s); }
  @Input() set initial(v: any) { if (v) this.values = { ...v }; }
  @Output() submitted = new EventEmitter<Record<string, any>>();

  fields: FormField[] = [];
  values: Record<string, any> = {};
  listeningField: string | null = null;
  voiceError = '';
  /** Estado del dictado holístico NLP */
  dictating = false;
  dictateLoading = false;
  nlpTranscript = '';
  /** Mapa de confianza por campo retornado por el servicio NLP */
  confidenceMap: Record<string, number> = {};

  private zone = inject(NgZone);
  private http = inject(HttpClient);
  private recognition: any = null;

  onSubmit() { this.submitted.emit(this.values); }

  /**
   * Dictado holístico: el funcionario habla una sola frase describiendo todos los campos.
   * El servicio NLP extrae los valores y los mapea al formulario.
   * El usuario puede revisar y corregir los datos interpretados (visto bueno).
   */
  startDictateAll() {
    if (this.dictating) { this.recognition?.stop(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { this.voiceError = 'Dictado no soportado. Usa Chrome.'; return; }
    this.voiceError = '';
    this.nlpTranscript = '';
    if (this.recognition) this.recognition.stop();
    const r = new SR();
    r.lang = 'es-ES';
    r.interimResults = false;
    r.maxAlternatives = 1;
    this.recognition = r;
    this.dictating = true;
    r.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.zone.run(() => {
        this.dictating = false;
        this.nlpTranscript = transcript;
        this._fillWithNlp(transcript);
      });
    };
    r.onerror = (e: any) => this.zone.run(() => {
      this.voiceError = 'Error de voz: ' + e.error;
      this.dictating = false;
    });
    r.onend = () => this.zone.run(() => { if (this.dictating) this.dictating = false; });
    r.start();
  }

  /** Envía la transcripción al microservicio NLP y aplica los valores retornados. */
  private _fillWithNlp(transcript: string) {
    this.dictateLoading = true;
    this.http.post<{ values: Record<string, string>; confidence: Record<string, number> }>(
      `${API_BASE}/ai-assistant/nlp/fill-form`,
      { transcript, fields: this.fields }
    ).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.dictateLoading = false;
          this.confidenceMap = res.confidence ?? {};
          const filled = Object.entries(res.values ?? {}).filter(([, v]) => !!v);
          filled.forEach(([k, v]) => { this.values[k] = v; });
          if (filled.length === 0) {
            this.voiceError = 'NLP: no se detectaron valores. Intenta describir los datos con más detalle.';
          }
        });
      },
      error: () => this.zone.run(() => {
        this.dictateLoading = false;
        this.voiceError = 'Error al procesar con NLP. Puedes llenar los campos manualmente.';
      }),
    });
  }

  voiceInput(fieldName: string) {
    if (this.listeningField === fieldName) { this.recognition?.stop(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { this.voiceError = 'Voz no soportada. Usa Chrome.'; return; }
    this.voiceError = '';
    if (this.recognition) this.recognition.stop();
    const r = new SR();
    r.lang = 'es-ES'; r.interimResults = false; r.maxAlternatives = 1;
    this.recognition = r;
    this.listeningField = fieldName;
    r.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.zone.run(() => { this.values[fieldName] = (this.values[fieldName] ? this.values[fieldName] + ' ' : '') + transcript; this.listeningField = null; });
    };
    r.onerror = (e: any) => this.zone.run(() => { this.voiceError = 'Error: ' + e.error; this.listeningField = null; });
    r.onend = () => this.zone.run(() => { if (this.listeningField === fieldName) this.listeningField = null; });
    r.start();
  }

  private _parseSchema(s: any): FormField[] {
    if (!s) return [];
    if (Array.isArray(s)) return s;
    if (s.fields) return s.fields;
    if (s.properties) {
      return Object.entries(s.properties).map(([name, def]: [string, any]) => ({
        name, label: def.title || name, type: def.type === 'string' && def.enum ? 'select' : (def.type || 'text'),
        required: (s.required || []).includes(name), options: def.enum
      }));
    }
    try { const parsed = JSON.parse(s); return this._parseSchema(parsed); } catch { return []; }
  }
}
