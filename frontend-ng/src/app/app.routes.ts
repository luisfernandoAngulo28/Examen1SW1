import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'my-tasks', loadComponent: () => import('./pages/officer-dashboard/officer-dashboard.component').then(m => m.OfficerDashboardComponent) },
      { path: 'departments', loadComponent: () => import('./pages/departments/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'monitor', loadComponent: () => import('./pages/monitor/monitor.component').then(m => m.MonitorComponent) },
      { path: 'policies/new', loadComponent: () => import('./pages/new-policy/new-policy.component').then(m => m.NewPolicyComponent) },
      { path: 'policies/:id/editor', loadComponent: () => import('./pages/policy-editor/policy-editor.component').then(m => m.PolicyEditorComponent) },
      { path: 'policies/:policyId/cases', loadComponent: () => import('./pages/cases/cases.component').then(m => m.CasesComponent) },
      { path: 'cases/:id', loadComponent: () => import('./pages/case-detail/case-detail.component').then(m => m.CaseDetailComponent) },
      { path: 'nuevo-proceso', loadComponent: () => import('./pages/nuevo-proceso/nuevo-proceso.component').then(m => m.NuevoProcesComponent) },
      { path: 'reports', loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
