import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <form (ngSubmit)="onSubmit()" class="login-card fade-in">
        <div class="login-brand">
          <h1>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:middle;margin-right:6px"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Workflow<span>SW1</span>
          </h1>
          <p>Sistema de Gestión de Políticas de Negocio</p>
        </div>

        @if (error) {
          <p style="color:var(--danger);text-align:center;margin-bottom:16px;font-size:14px;font-weight:600">{{ error }}</p>
        }

        <div style="margin-bottom:20px">
          <label class="form-label">Email</label>
          <input type="email" [(ngModel)]="email" name="email" required class="form-input" placeholder="admin@demo.com" />
        </div>
        <div style="margin-bottom:24px">
          <label class="form-label">Contraseña</label>
          <input type="password" [(ngModel)]="password" name="password" required class="form-input" placeholder="••••••" />
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center">Iniciar sesión</button>
        <div style="text-align:center;margin-top:16px">
          <a routerLink="/register" style="color:var(--primary);font-size:13px">¿No tienes cuenta? Regístrate</a>
        </div>
      </form>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate([this.auth.user()?.role === 'OFFICER' ? '/my-tasks' : '/']),
      error: () => this.error = 'Credenciales inválidas'
    });
  }
}
