import { Component, Input, Output, EventEmitter, NgZone, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../api';

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'grid' | 'button';
  required?: boolean;
  options?: string[];
  columns?: string[];   // for grid type: column headers
  buttonLabel?: string; // for button type: action label
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <!-- Barra de dictado holístico NLP — solo visible si el nodo tiene voiceEnabled -->
    @if (voiceEnabled) {
    <div style="background:linear-gradient(135deg,#e6f4ff,#f0f9ff);border:1px solid #91caff;border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;font-weight:600;color:#1677ff;display:inline-flex;align-items:center;gap:4px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
          Dictado inteligente (NLP)
        </span>
        <button type="button" (click)="startDictateAll()"
          [disabled]="dictateLoading"
          [style.background]="dictating ? '#ff4d4f' : '#1677ff'"
          style="color:#fff;border:none;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:4px">
          @if (dictating) {
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg> Escuchando...
          } @else if (dictateLoading) {
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Procesando...
          } @else {
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Dictar todo
          }
        </button>
        <span style="font-size:11px;color:#666">Describe todos los datos en una sola frase</span>
      </div>
      @if (nlpTranscript) {
        <div style="font-size:11px;color:#555;font-style:italic;background:#fff;padding:4px 8px;border-radius:4px;border-left:3px solid #1677ff">
          "{{ nlpTranscript }}"
        </div>
      }
    </div>
    } <!-- /voiceEnabled NLP bar -->

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
              <textarea class="form-input" [(ngModel)]="values[field.name]" [required]="!!field.required" [style.padding-right]="voiceEnabled ? '36px' : null"></textarea>
              @if (voiceEnabled) {
                <button type="button" (click)="voiceInput(field.name)"
                  [style.color]="listeningField === field.name ? '#ff4d4f' : 'var(--text-secondary)'"
                  style="position:absolute;right:6px;top:6px;background:none;border:none;cursor:pointer;display:inline-flex;align-items:center"
                  title="Dictar por voz">
                  @if (listeningField === field.name) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4d4f" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  }
                </button>
              }
            </div>
          } @else if (field.type === 'select') {
            <div style="display:flex;gap:4px;align-items:center">
              <select class="form-select" style="flex:1" [(ngModel)]="values[field.name]">
                <option value="">Seleccionar...</option>
                @for (opt of field.options; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
              @if (voiceEnabled) {
                <button type="button" (click)="voiceSelect(field.name, field.options || [])"
                  [style.color]="listeningField === field.name ? '#ff4d4f' : 'var(--text-secondary)'"
                  class="btn btn-ghost btn-sm" title="Elegir opción por voz" style="display:inline-flex;align-items:center;flex-shrink:0">
                  @if (listeningField === field.name) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  }
                </button>
              }
            </div>
          } @else if (field.type === 'text') {
            <div style="display:flex;gap:4px">
              <input type="text" class="form-input" [(ngModel)]="values[field.name]" [required]="!!field.required" style="flex:1" />
              @if (voiceEnabled) {
                <button type="button" (click)="voiceInput(field.name)"
                  [style.color]="listeningField === field.name ? '#ff4d4f' : 'var(--text-secondary)'"
                  class="btn btn-ghost btn-sm" title="Dictar campo" style="display:inline-flex;align-items:center">
                  @if (listeningField === field.name) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  }
                </button>
              }
            </div>
          } @else if (field.type === 'grid') {
            <div style="border:1px solid #d9d9d9;border-radius:6px;overflow:hidden">
              <table style="width:100%;border-collapse:collapse;font-size:12px">
                <thead>
                  <tr style="background:#f0f5ff">
                    @for (col of (field.columns || []); track col) {
                      <th style="padding:6px 10px;border-bottom:1px solid #d9d9d9;text-align:left;font-weight:600;color:#1677ff">{{ col }}</th>
                    }
                    <th style="width:36px;padding:6px;border-bottom:1px solid #d9d9d9"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of getGridRows(field.name); track $index; let ri = $index) {
                    <tr [style.background]="ri % 2 === 0 ? '#fff' : '#fafafa'">
                      @for (col of (field.columns || []); track col) {
                        <td style="padding:4px 6px;border-bottom:1px solid #f0f0f0">
                          <input type="text" class="form-input" style="font-size:12px;padding:4px 6px"
                            [ngModel]="getGridCell(field.name, ri, col)"
                            (ngModelChange)="setGridCell(field.name, ri, col, $event)" />
                        </td>
                      }
                      <td style="padding:4px;text-align:center;border-bottom:1px solid #f0f0f0">
                        <button type="button" (click)="removeGridRow(field.name, ri)"
                          style="background:none;border:none;color:#ff4d4f;cursor:pointer;display:inline-flex;align-items:center" title="Eliminar fila">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              <div style="padding:6px 10px;border-top:1px solid #f0f0f0;background:#fafafa">
                <button type="button" (click)="addGridRow(field.name, field.columns || [])"
                  style="background:none;border:1px dashed #1677ff;color:#1677ff;border-radius:4px;padding:3px 10px;font-size:12px;cursor:pointer">
                  + Agregar fila
                </button>
              </div>
            </div>
          } @else if (field.type === 'button') {
            <button type="button" (click)="onButtonAction(field.name, field.buttonLabel)"
              class="btn btn-secondary btn-sm" style="min-width:120px">
              {{ field.buttonLabel || field.label }}
            </button>
          } @else if (field.type === 'number') {
            <div style="display:flex;gap:4px">
              <input type="number" class="form-input" [(ngModel)]="values[field.name]" [required]="!!field.required" style="flex:1" />
              @if (voiceEnabled) {
                <button type="button" (click)="voiceNumber(field.name)"
                  [style.color]="listeningField === field.name ? '#ff4d4f' : 'var(--text-secondary)'"
                  class="btn btn-ghost btn-sm" title="Dictar número" style="display:inline-flex;align-items:center;flex-shrink:0">
                  @if (listeningField === field.name) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  }
                </button>
              }
            </div>
          } @else if (field.type === 'date') {
            <div style="display:flex;gap:4px">
              <input type="date" class="form-input" [(ngModel)]="values[field.name]" [required]="!!field.required" style="flex:1" />
              @if (voiceEnabled) {
                <button type="button" (click)="voiceDate(field.name)"
                  [style.color]="listeningField === field.name ? '#ff4d4f' : 'var(--text-secondary)'"
                  class="btn btn-ghost btn-sm" title="Dictar fecha" style="display:inline-flex;align-items:center;flex-shrink:0">
                  @if (listeningField === field.name) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  }
                </button>
              }
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
  /** Si false, oculta todos los controles de voz/NLP del formulario */
  @Input() voiceEnabled = true;
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

  // ── Grid helpers ──────────────────────────────────────────────────────────
  getGridRows(fieldName: string): any[] {
    if (!Array.isArray(this.values[fieldName])) this.values[fieldName] = [];
    return this.values[fieldName];
  }
  getGridCell(fieldName: string, rowIdx: number, col: string): string {
    return this.values[fieldName]?.[rowIdx]?.[col] ?? '';
  }
  setGridCell(fieldName: string, rowIdx: number, col: string, val: string) {
    if (!Array.isArray(this.values[fieldName])) this.values[fieldName] = [];
    this.values[fieldName][rowIdx] = { ...this.values[fieldName][rowIdx], [col]: val };
  }
  addGridRow(fieldName: string, columns: string[]) {
    if (!Array.isArray(this.values[fieldName])) this.values[fieldName] = [];
    const emptyRow: Record<string, string> = {};
    columns.forEach(c => emptyRow[c] = '');
    this.values[fieldName] = [...this.values[fieldName], emptyRow];
  }
  removeGridRow(fieldName: string, rowIdx: number) {
    this.values[fieldName] = this.values[fieldName].filter((_: any, i: number) => i !== rowIdx);
  }

  // ── Button helper ─────────────────────────────────────────────────────────
  onButtonAction(fieldName: string, label?: string) {
    this.values[fieldName] = `Ejecutado: ${label || fieldName} (${new Date().toLocaleTimeString()})`;
  }

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

  /** Voz para campo numérico — extrae el primer número del transcript. */
  voiceNumber(fieldName: string) {
    this._startVoice(fieldName, (transcript) => {
      const match = transcript.replace(/,/g, '.').match(/[\d]+(?:\.\d+)?/);
      if (match) {
        this.values[fieldName] = match[0];
      } else {
        this.voiceError = 'No se detectó un número. Intenta de nuevo.';
      }
    });
  }

  /** Voz para campo fecha — usa el servicio NLP para parsear la fecha. */
  voiceDate(fieldName: string) {
    this._startVoice(fieldName, (transcript) => {
      this.dictateLoading = true;
      this.http.post<{ values: Record<string, string>; confidence: Record<string, number> }>(
        `${API_BASE}/ai-assistant/nlp/fill-form`,
        { transcript, fields: [{ name: fieldName, label: 'fecha', type: 'date', required: false }] }
      ).subscribe({
        next: (res) => this.zone.run(() => {
          this.dictateLoading = false;
          const val = res.values?.[fieldName];
          if (val) { this.values[fieldName] = val; }
          else { this.voiceError = 'No se reconoció la fecha. Di por ejemplo: "quince de junio de 2026".'; }
        }),
        error: () => this.zone.run(() => { this.dictateLoading = false; this.voiceError = 'Error al procesar fecha.'; }),
      });
    });
  }

  /** Voz para campo select — busca la opción más similar al transcript. */
  voiceSelect(fieldName: string, options: string[]) {
    this._startVoice(fieldName, (transcript) => {
      const lower = transcript.toLowerCase();
      const match = options.find(opt => lower.includes(opt.toLowerCase()))
        ?? options.find(opt => opt.toLowerCase().split(' ').some(w => w.length > 3 && lower.includes(w)));
      if (match) {
        this.values[fieldName] = match;
      } else {
        this.voiceError = `No se reconoció la opción. Opciones disponibles: ${options.join(', ')}`;
      }
    });
  }

  /** Helper interno para iniciar reconocimiento de voz con callback de resultado. */
  private _startVoice(fieldName: string, onResult: (transcript: string) => void) {
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
      this.zone.run(() => { this.listeningField = null; onResult(transcript); });
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
