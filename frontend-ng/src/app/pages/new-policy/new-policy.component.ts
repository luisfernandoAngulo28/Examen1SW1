import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { API_BASE } from '../../api';

@Component({
  selector: 'app-new-policy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h1>Nueva Política de Negocio</h1></div>
    <div class="page-body fade-in">
      <div class="card" style="max-width:480px;padding:32px">
        @if (error) {
          <div style="background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:13px">{{ error }}</div>
        }
        <div style="margin-bottom:20px">
          <label class="form-label">Nombre de la política *</label>
          <input type="text" [(ngModel)]="name" class="form-input" placeholder="Ej: Solicitud de Vacaciones" />
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
  readonly router = inject(Router);
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  create() {
    if (!this.name.trim()) { this.error = 'El nombre es requerido'; return; }
    this.loading = true;
    this.http.post<{ id: string }>(`${API_BASE}/policies`, { name: this.name }).subscribe({
      next: (p) => { this.toast.show('Política creada', 'success'); this.router.navigate(['/policies', p.id, 'editor']); },
      error: () => { this.error = 'Error al crear política'; this.loading = false; }
    });
  }
}
