import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { API_BASE } from '../../api';

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

interface ReportResult {
  title: string;
  reportType: string;
  query: string;
  generatedAt: string;
  totalRows: number;
  rows: Record<string, any>[];
  summary: Record<string, any>;
}

const EXAMPLE_QUERIES = [
  'Trámites completados este mes',
  'Trámites entre el 1 de enero y el 31 de mayo de 2026',
  'Tareas pendientes por departamento',
  'Cuellos de botella en todos los flujos',
  'Resumen general del sistema',
  'Trámites cancelados',
];

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/" style="font-size:13px;display:inline-flex;align-items:center;gap:4px">← Dashboard</a>
        <h1 style="margin-top:4px">Reportes por Lenguaje Natural</h1>
      </div>
    </div>

    <div class="page-body fade-in">

      <!-- Query box -->
      <div class="card" style="padding:24px;margin-bottom:24px">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:12px">
          Describe el reporte que necesitas en lenguaje natural:
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <input type="text" class="form-input" style="flex:1;font-size:15px"
            [(ngModel)]="query"
            placeholder='Ej: "Trámites completados entre enero y mayo del departamento Técnico"'
            (keyup.enter)="runReport()" />
          <button (click)="toggleVoice()"
            [style.background]="listening ? '#ff4d4f' : 'var(--bg-secondary)'"
            [style.color]="listening ? '#fff' : 'var(--text-secondary)'"
            [style.border]="'1px solid ' + (listening ? '#ff4d4f' : 'var(--border)')"
            style="padding:0 14px;border-radius:6px;cursor:pointer;font-size:18px;display:inline-flex;align-items:center"
            title="Dictar consulta">
            @if (listening) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            }
          </button>
          <button (click)="runReport()" [disabled]="loading || !query.trim()"
            class="btn btn-primary" style="min-width:120px">
            @if (loading) { <span class="spinner" style="width:14px;height:14px;border-width:2px;margin-right:6px"></span> }
            Generar reporte
          </button>
        </div>

        @if (listening) {
          <div style="display:flex;align-items:center;gap:8px;color:#ff4d4f;font-size:13px;margin-bottom:8px">
            <span style="display:inline-block;width:8px;height:8px;background:#ff4d4f;border-radius:50%;animation:pulse 1s infinite"></span>
            Escuchando... (habla tu consulta)
          </div>
        }

        <!-- Example chips -->
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <span style="font-size:11px;color:#999;align-self:center">Ejemplos:</span>
          @for (ex of examples; track ex) {
            <button (click)="useExample(ex)"
              style="background:#f5f5f5;border:1px solid #e8e8e8;border-radius:12px;padding:3px 10px;font-size:12px;cursor:pointer;color:#555;transition:all .15s"
              (mouseenter)="$any($event.target).style.background='#e6f4ff'"
              (mouseleave)="$any($event.target).style.background='#f5f5f5'">
              {{ ex }}
            </button>
          }
        </div>
      </div>

      <!-- Results -->
      @if (result) {
        <div class="card" style="margin-bottom:20px">

          <!-- Header -->
          <div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
            <div>
              <h2 style="font-size:17px;font-weight:700;margin:0 0 4px">{{ result.title }}</h2>
              <div style="font-size:12px;color:var(--text-secondary)">
                Generado: {{ result.generatedAt | date:'dd/MM/yyyy HH:mm' }} ·
                <em>"{{ result.query }}"</em>
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button (click)="exportCsv()" class="btn btn-ghost btn-sm"
                style="display:inline-flex;align-items:center;gap:4px">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                CSV
              </button>
              <button (click)="exportExcel()" class="btn btn-ghost btn-sm"
                style="display:inline-flex;align-items:center;gap:4px;color:#217346">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                Excel
              </button>
              <button (click)="exportPdf()" class="btn btn-ghost btn-sm"
                style="display:inline-flex;align-items:center;gap:4px;color:#c0392b">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="9" y1="9" x2="9.01" y2="9"/></svg>
                PDF
              </button>
            </div>
          </div>

          <!-- Summary KPIs -->
          @if (summaryEntries.length > 0) {
            <div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;flex-wrap:wrap;gap:12px">
              @for (kv of summaryEntries; track kv.key) {
                <div style="background:#f6f8ff;border:1px solid #d6e4ff;border-radius:8px;padding:10px 16px;min-width:100px;text-align:center">
                  <div style="font-size:20px;font-weight:700;color:#1677ff">{{ kv.value }}</div>
                  <div style="font-size:11px;color:#666;text-transform:capitalize">{{ kv.key.replace('_', ' ') }}</div>
                </div>
              }
            </div>
          }

          <!-- Table -->
          @if (result.rows.length > 0) {
            <div style="overflow-x:auto">
              <table class="table">
                <thead>
                  <tr>
                    @for (col of tableColumns; track col) {
                      <th style="text-transform:capitalize">{{ col.replace('_', ' ') }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of result.rows; track $index) {
                    <tr>
                      @for (col of tableColumns; track col) {
                        <td [style.color]="getCellColor(col, row[col])">
                          {{ row[col] ?? '—' }}
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div style="padding:10px 24px;font-size:12px;color:var(--text-secondary);border-top:1px solid var(--border)">
              {{ result.totalRows }} resultado(s) encontrado(s)
            </div>
          } @else {
            <div style="padding:48px;text-align:center;color:var(--text-secondary)">
              No se encontraron datos para esta consulta.
            </div>
          }

        </div>
      }

      @if (error) {
        <div style="background:#fff2f0;border:1px solid #ffccc7;border-radius:8px;padding:16px;color:#cf1322">
          Error: {{ error }}
        </div>
      }

    </div>

    <style>
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
    </style>
  `
})
export class ReportsComponent {
  query = '';
  loading = false;
  listening = false;
  error = '';
  result: ReportResult | null = null;
  readonly examples = EXAMPLE_QUERIES;

  private recognition: any = null;
  private http = inject(HttpClient);
  private zone = inject(NgZone);
  private toast = inject(ToastService);

  get tableColumns(): string[] {
    if (!this.result || this.result.rows.length === 0) return [];
    return Object.keys(this.result.rows[0]);
  }

  get summaryEntries(): { key: string; value: any }[] {
    if (!this.result?.summary) return [];
    return Object.entries(this.result.summary).map(([k, v]) => ({ key: k, value: v }));
  }

  runReport() {
    if (!this.query.trim() || this.loading) return;
    this.loading = true;
    this.error = '';
    this.result = null;
    this.http.post<ReportResult>(`${API_BASE}/reports/query`, { query: this.query }).subscribe({
      next: (res) => this.zone.run(() => { this.result = res; this.loading = false; }),
      error: (err) => this.zone.run(() => {
        this.error = err?.error?.error ?? 'Error al generar el reporte.';
        this.loading = false;
        this.toast.show(this.error, 'error');
      }),
    });
  }

  useExample(ex: string) {
    this.query = ex;
    this.runReport();
  }

  toggleVoice() {
    if (this.listening) { this.recognition?.stop(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { this.error = 'Reconocimiento de voz no soportado en este navegador.'; return; }
    this.error = '';
    const r = new SR();
    r.lang = 'es-ES'; r.interimResults = false; r.maxAlternatives = 1;
    this.recognition = r;
    this.listening = true;
    r.onresult = (event: any) => this.zone.run(() => {
      this.query = event.results[0][0].transcript;
      this.listening = false;
      this.runReport();
    });
    r.onerror = (e: any) => this.zone.run(() => { this.error = 'Error de voz: ' + e.error; this.listening = false; });
    r.onend = () => this.zone.run(() => { this.listening = false; });
    r.start();
  }

  getCellColor(col: string, val: any): string {
    if (col === 'riesgo' || col === 'carga') {
      if (val === 'Alto' || val === 'Alta') return '#cf1322';
      if (val === 'Medio' || val === 'Media') return '#d48806';
      if (val === 'Bajo' || val === 'Baja') return '#389e0d';
    }
    if (col === 'estado') {
      if (val === 'COMPLETED') return '#52c41a';
      if (val === 'CANCELLED') return '#ff4d4f';
      if (val === 'IN_PROGRESS') return '#1677ff';
    }
    return '';
  }

  exportCsv() {
    if (!this.result || this.result.rows.length === 0) return;
    const cols = this.tableColumns;
    const header = cols.join(',');
    const rows = this.result.rows.map(r =>
      cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${this.result.reportType}_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show('CSV exportado correctamente', 'success');
  }

  exportExcel() {
    if (!this.result || this.result.rows.length === 0) return;
    const cols = this.tableColumns;
    const headerRow = cols.map(c => `<th style="background:#1677ff;color:#fff;font-weight:bold;padding:6px 10px;border:1px solid #aaa">${c.replace(/_/g,' ')}</th>`).join('');
    const dataRows = this.result.rows.map(r =>
      `<tr>${cols.map(c => `<td style="padding:4px 8px;border:1px solid #ddd">${r[c] ?? ''}</td>`).join('')}</tr>`
    ).join('');
    const summaryRows = Object.entries(this.result.summary ?? {})
      .map(([k, v]) => `<tr><td style="font-weight:bold;padding:4px 8px">${k}</td><td style="padding:4px 8px">${v}</td></tr>`)
      .join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>${this.result.title}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body>
        <h2>${this.result.title}</h2>
        <p>Consulta: ${this.result.query} | Generado: ${new Date().toLocaleString('es-BO')}</p>
        <table border="1"><thead><tr>${headerRow}</tr></thead><tbody>${dataRows}</tbody></table>
        <br/><h3>Resumen</h3><table border="1"><tbody>${summaryRows}</tbody></table>
      </body></html>`;

    const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${this.result.reportType}_${new Date().toISOString().substring(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show('Excel exportado correctamente', 'success');
  }

  exportPdf() {
    if (!this.result) return;
    const cols = this.tableColumns;
    const headerCells = cols.map(c => `<th>${c.replace(/_/g,' ')}</th>`).join('');
    const dataRows = this.result.rows.map(r =>
      `<tr>${cols.map(c => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`
    ).join('');

    const win = window.open('', '_blank')!;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>${this.result.title}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;color:#222}
        h1{font-size:18px;margin-bottom:4px}
        p{font-size:12px;color:#666;margin-bottom:16px}
        table{border-collapse:collapse;width:100%;font-size:12px}
        th{background:#1677ff;color:#fff;padding:6px 10px;text-align:left;border:1px solid #aaa}
        td{padding:5px 10px;border:1px solid #ddd}
        tr:nth-child(even){background:#f5f5f5}
        .summary{margin-top:20px;font-size:13px}
        .kpi{display:inline-block;background:#f0f5ff;border:1px solid #d6e4ff;border-radius:6px;padding:8px 16px;margin:4px;text-align:center}
        .kpi-val{font-size:20px;font-weight:bold;color:#1677ff}
        .kpi-lbl{font-size:11px;color:#888;text-transform:capitalize}
        @media print{button{display:none}}
      </style></head><body>
      <button onclick="window.print()" style="position:fixed;top:10px;right:10px;padding:8px 20px;background:#1677ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">Imprimir / Guardar PDF</button>
      <h1>${this.result.title}</h1>
      <p>Consulta: <em>"${this.result.query}"</em> — Generado: ${new Date().toLocaleString('es-BO')}</p>
      <div class="summary">
        ${Object.entries(this.result.summary ?? {}).map(([k,v]) =>
          `<div class="kpi"><div class="kpi-val">${v}</div><div class="kpi-lbl">${k.replace(/_/g,' ')}</div></div>`
        ).join('')}
      </div>
      <br/>
      <table><thead><tr>${headerCells}</tr></thead><tbody>${dataRows}</tbody></table>
      </body></html>`);
    win.document.close();
    this.toast.show('PDF listo para imprimir', 'success');
  }
}
