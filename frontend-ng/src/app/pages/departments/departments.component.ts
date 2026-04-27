import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { API_BASE } from '../../api';

interface Dept { id: string; name: string; users: { id: string; name: string }[]; }

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:8px"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        Departamentos
      </h1>
    </div>
    <div class="page-body fade-in">
      <div style="display:flex;gap:8px;margin-bottom:24px">
        <input [(ngModel)]="newName" placeholder="Nombre del departamento" class="form-input" style="flex:1" (keydown.enter)="create()" />
        <button (click)="create()" class="btn btn-primary">+ Crear</button>
      </div>
      <div class="card">
        <table class="table">
          <thead><tr><th>Nombre</th><th>Usuarios</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (d of departments; track d.id) {
              <tr>
                <td style="font-weight:600">{{ d.name }}</td>
                <td style="color:var(--text-secondary)">{{ d.users?.length || 0 }} usuarios</td>
                <td>
                  <button (click)="delete(d.id)" class="btn btn-danger btn-sm">🗑 Eliminar</button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="3" style="text-align:center;padding:40px;color:var(--text-secondary)">No hay departamentos</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DepartmentsComponent implements OnInit {
  departments: Dept[] = [];
  newName = '';
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  ngOnInit() { this.load(); }
  load() { this.http.get<Dept[]>(`${API_BASE}/departments`).subscribe(d => this.departments = d); }

  create() {
    if (!this.newName.trim()) return;
    this.http.post(`${API_BASE}/departments`, { name: this.newName }).subscribe({
      next: () => { this.toast.show('Departamento creado', 'success'); this.newName = ''; this.load(); },
      error: () => this.toast.show('Error al crear', 'error')
    });
  }

  delete(id: string) {
    this.http.delete(`${API_BASE}/departments/${id}`).subscribe({
      next: () => { this.toast.show('Eliminado', 'info'); this.load(); },
      error: () => this.toast.show('Error al eliminar', 'error')
    });
  }
}
