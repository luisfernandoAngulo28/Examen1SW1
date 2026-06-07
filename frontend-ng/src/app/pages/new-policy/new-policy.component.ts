import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { API_BASE } from '../../api';

interface Template {
  id: string; icon: string; label: string; desc: string;
  nodes: { title: string; nodeType: string; departmentName?: string }[];
  edges: { fromIdx: number; toIdx: number; flowType: string; conditionLabel?: string }[];
}

const TEMPLATES: Template[] = [
  {
    id: 'blank', icon: '⬜', label: 'En blanco', desc: 'Empieza desde cero con un lienzo vacío',
    nodes: [], edges: [],
  },
  {
    id: 'sequential', icon: '➡️', label: 'Secuencial', desc: 'Inicio → Tarea A → Tarea B → Fin',
    nodes: [
      { title: 'INICIO', nodeType: 'INITIAL' },
      { title: 'Recibir Solicitud', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'Revisión', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'FIN', nodeType: 'FINAL' },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, flowType: 'SEQUENTIAL' },
      { fromIdx: 1, toIdx: 2, flowType: 'SEQUENTIAL' },
      { fromIdx: 2, toIdx: 3, flowType: 'SEQUENTIAL' },
    ],
  },
  {
    id: 'conditional', icon: '◇', label: 'Condicional', desc: 'Con DECISION: Aprobado / Rechazado',
    nodes: [
      { title: 'INICIO', nodeType: 'INITIAL' },
      { title: 'Recibir Solicitud', nodeType: 'ACTION', departmentName: 'General' },
      { title: '¿Aprobado?', nodeType: 'DECISION' },
      { title: 'Aprobar', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'Rechazar', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'FIN', nodeType: 'FINAL' },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, flowType: 'SEQUENTIAL' },
      { fromIdx: 1, toIdx: 2, flowType: 'SEQUENTIAL' },
      { fromIdx: 2, toIdx: 3, flowType: 'CONDITIONAL', conditionLabel: 'Aprobado' },
      { fromIdx: 2, toIdx: 4, flowType: 'CONDITIONAL', conditionLabel: 'Rechazado' },
      { fromIdx: 3, toIdx: 5, flowType: 'SEQUENTIAL' },
      { fromIdx: 4, toIdx: 5, flowType: 'SEQUENTIAL' },
    ],
  },
  {
    id: 'parallel', icon: '⑂', label: 'Paralelo', desc: 'FORK → 3 ramas simultáneas → JOIN',
    nodes: [
      { title: 'INICIO', nodeType: 'INITIAL' },
      { title: 'Recibir', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'FORK', nodeType: 'FORK' },
      { title: 'Revisión A', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'Revisión B', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'Revisión C', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'JOIN', nodeType: 'JOIN' },
      { title: 'Aprobación Final', nodeType: 'ACTION', departmentName: 'General' },
      { title: 'FIN', nodeType: 'FINAL' },
    ],
    edges: [
      { fromIdx: 0, toIdx: 1, flowType: 'SEQUENTIAL' },
      { fromIdx: 1, toIdx: 2, flowType: 'SEQUENTIAL' },
      { fromIdx: 2, toIdx: 3, flowType: 'PARALLEL' },
      { fromIdx: 2, toIdx: 4, flowType: 'PARALLEL' },
      { fromIdx: 2, toIdx: 5, flowType: 'PARALLEL' },
      { fromIdx: 3, toIdx: 6, flowType: 'SEQUENTIAL' },
      { fromIdx: 4, toIdx: 6, flowType: 'SEQUENTIAL' },
      { fromIdx: 5, toIdx: 6, flowType: 'SEQUENTIAL' },
      { fromIdx: 6, toIdx: 7, flowType: 'SEQUENTIAL' },
      { fromIdx: 7, toIdx: 8, flowType: 'SEQUENTIAL' },
    ],
  },
];

@Component({
  selector: 'app-new-policy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Nueva Política de Negocio</h1></div>
    <div class="page-body fade-in">

      <!-- Plantillas -->
      <h3 style="font-size:15px;font-weight:700;margin-bottom:12px">Elige una plantilla</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:28px">
        @for (t of templates; track t.id) {
          <div (click)="selectedTemplate=t.id"
               [style.border]="selectedTemplate===t.id ? '2px solid #722ed1' : '1px solid var(--border)'"
               [style.background]="selectedTemplate===t.id ? 'rgba(114,46,209,.08)' : 'var(--bg-secondary)'"
               style="border-radius:12px;padding:16px;cursor:pointer;transition:all .2s">
            <div style="font-size:28px;margin-bottom:8px">{{ t.icon }}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">{{ t.label }}</div>
            <div style="font-size:12px;color:var(--text-secondary)">{{ t.desc }}</div>
            @if (selectedTemplate === t.id) {
              <div style="margin-top:8px;color:#722ed1;font-size:11px;font-weight:600">✓ Seleccionada</div>
            }
          </div>
        }
      </div>

      <!-- Formulario -->
      <div class="card" style="max-width:480px;padding:32px">
        @if (error) {
          <div style="background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:13px">{{ error }}</div>
        }
        <div style="margin-bottom:20px">
          <label class="form-label">Nombre de la política *</label>
          <input type="text" [(ngModel)]="name" class="form-input" placeholder="Ej: Solicitud de Permiso Municipal" />
        </div>
        <div style="display:flex;gap:8px">
          <button (click)="create()" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Creando...' : '+ Crear y Editar Diagrama' }}
          </button>
          <button (click)="router.navigate(['/'])" class="btn btn-ghost">Cancelar</button>
        </div>
      </div>
    </div>
  `
})
export class NewPolicyComponent {
  name = '';
  loading = false;
  error = '';
  selectedTemplate = 'blank';
  templates = TEMPLATES;
  readonly router = inject(Router);
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  create() {
    if (!this.name.trim()) { this.error = 'El nombre es requerido'; return; }
    this.loading = true;
    this.http.post<{ id: string }>(`${API_BASE}/policies`, { name: this.name }).subscribe({
      next: (p) => {
        const tpl = TEMPLATES.find(t => t.id === this.selectedTemplate);
        if (!tpl || tpl.nodes.length === 0) {
          this.toast.show('Política creada', 'success');
          this.router.navigate(['/policies', p.id, 'editor']);
          return;
        }
        // Crear nodos de la plantilla
        this.http.get<any[]>(`${API_BASE}/departments`).subscribe(depts => {
          const defaultDeptId = depts[0]?.id || '';
          const nodeIds: string[] = [];
          let pending = tpl.nodes.length;
          const createdIds: string[] = new Array(tpl.nodes.length);

          tpl.nodes.forEach((n, i) => {
            const deptId = depts.find(d => d.name === n.departmentName)?.id || defaultDeptId;
            this.http.post<any>(`${API_BASE}/policies/${p.id}/nodes`, {
              title: n.title, nodeType: n.nodeType,
              departmentId: ['INITIAL','FINAL','FORK','JOIN','DECISION'].includes(n.nodeType) ? null : deptId,
              positionX: 100 + i * 160, positionY: 100 + (i % 3) * 120,
            }).subscribe(node => {
              createdIds[i] = node.id;
              pending--;
              if (pending === 0) {
                // Crear aristas
                let edgePending = tpl.edges.length || 1;
                if (tpl.edges.length === 0) { this._done(p.id); return; }
                tpl.edges.forEach(e => {
                  this.http.post(`${API_BASE}/policies/${p.id}/edges`, {
                    fromNodeId: createdIds[e.fromIdx], toNodeId: createdIds[e.toIdx],
                    flowType: e.flowType, conditionLabel: e.conditionLabel || null,
                  }).subscribe({ next: () => { edgePending--; if (edgePending === 0) this._done(p.id); }, error: () => { edgePending--; if (edgePending === 0) this._done(p.id); } });
                });
              }
            });
          });
        });
      },
      error: () => { this.error = 'Error al crear política'; this.loading = false; }
    });
  }

  private _done(id: string) {
    this.toast.show('Política creada con plantilla', 'success');
    this.router.navigate(['/policies', id, 'editor']);
  }
}
