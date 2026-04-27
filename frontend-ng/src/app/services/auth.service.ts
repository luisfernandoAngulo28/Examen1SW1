import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DESIGNER' | 'OFFICER' | 'ADMIN' | 'SUPERVISOR';
  departmentId?: string | null;
}

export interface AuthResponse {
  token: string;
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string | null;
}

const API = (import.meta as any).env?.['VITE_API_URL'] || 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly token = signal<string | null>(localStorage.getItem('token'));
  readonly isLoading = signal(true);

  constructor(private http: HttpClient, private router: Router) {
    if (this.token()) {
      this.http.get<User>(`${API}/auth/me`).subscribe({
        next: (u) => { this.user.set(u); this.isLoading.set(false); },
        error: () => { localStorage.removeItem('token'); this.token.set(null); this.isLoading.set(false); }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        this.token.set(res.token);
        this.user.set({ id: res.id, email: res.email, name: res.name, role: res.role as User['role'], departmentId: res.departmentId });
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
