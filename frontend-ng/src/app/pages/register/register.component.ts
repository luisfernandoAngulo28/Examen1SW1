import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { API_BASE } from '../../api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card fade-in" style="max-width:460px">
        <div class="login-brand">
          <h1><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:middle;margin-right:6px"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Workflow<span>SW1</span></h1>
          <p>Crear nuevo usuario</p>
        </div>

        @if (error) {
          <div style="background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:16px">{{ error }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div style="margin-bottom:16px">
            <label class="form-label">Nombre completo</label>
            <input type="text" class="form-input" [(ngModel)]="form.name" name="name" required placeholder="Juan Pérez" />
          </div>
          <div style="margin-bottom:16px">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-input" [(ngModel)]="form.email" name="email" required placeholder="correo@empresa.com" />
          </div>
          <div style="margin-bottom:16px">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-input" [(ngModel)]="form.password" name="password" required placeholder="Mínimo 6 caracteres" />
          </div>
          <div style="margin-bottom:16px">
            <label class="form-label">Rol</label>
            <select class="form-input" [(ngModel)]="form.role" name="role">
              <option value="OFFICER">Funcionario (OFFICER)</option>
              <option value="DESIGNER">Diseñador (DESIGNER)</option>
            </select>
          </div>
          <div style="margin-bottom:20px">
            <label class="form-label">Departamento (opcional)</label>
            <select class="form-input" [(ngModel)]="form.departmentId" name="departmentId">
              <option value="">Sin departamento</option>
              @for (d of departments; track d.id) {
                <option [value]="d.id">{{ d.name }}</option>
              }
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;padding:12px;font-size:15px;justify-content:center" [disabled]="loading">
            {{ loading ? 'Creando...' : 'Crear usuario' }}
          </button>
        </form>
        <div style="text-align:center;margin-top:16px">
          <a routerLink="/login" style="color:var(--primary);font-size:13px">← Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  form = { name: '', email: '', password: '', role: 'OFFICER', departmentId: '' };
  departments: { id: string; name: string }[] = [];
  loading = false;
  error = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  readonly auth = inject(AuthService);

  ngOnInit() {
    this.http.get<any[]>(`${API_BASE}/departments`).subscribe({ next: (d) => this.departments = d, error: () => {} });
  }

  onSubmit() {
    this.error = '';
    if (this.form.password.length < 6) { this.error = 'La contraseña debe tener al menos 6 caracteres'; return; }
    this.loading = true;
    this.http.post(`${API_BASE}/auth/register`, {
      name: this.form.name, email: this.form.email, password: this.form.password,
      role: this.form.role, departmentId: this.form.departmentId || undefined
    }).subscribe({
      next: () => {
        this.toast.show('Usuario creado exitosamente', 'success');
        this.loading = false;
        this.router.navigate([this.auth.user() ? '/' : '/login']);
      },
      error: (err) => { this.error = err.error?.message || 'Error al registrar usuario'; this.loading = false; }
    });
  }
}
