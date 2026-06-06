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
            {{ listening ? '⏹' : '🎤' }}
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
              (mouseenter)="$event.target['style'].background='#e6f4ff'"
              (mouseleave)="$event.target['style'].background='#f5f5f5'">
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
            <button (click)="exportCsv()" class="btn btn-ghost btn-sm"
              style="display:inline-flex;align-items:center;gap:4px">
              ⬇ Exportar CSV
            </button>
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
    this.toast.show('CSV exportado', 'success');
  }
}
