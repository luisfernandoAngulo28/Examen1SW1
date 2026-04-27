import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const STATUS_MAP: Record<string, { color: string; label: string; bg: string }> = {
  PENDING:     { color: '#dc2626', label: 'Pendiente',   bg: '#fef2f2' },
  IN_PROGRESS: { color: '#d97706', label: 'En Proceso',  bg: '#fffbeb' },
  DONE:        { color: '#16a34a', label: 'Completado',  bg: '#f0fdf4' },
  BLOCKED:     { color: '#dc2626', label: 'Bloqueado',   bg: '#fef2f2' },
  OPEN:        { color: '#2563eb', label: 'Abierto',     bg: '#eff6ff' },
  COMPLETED:   { color: '#16a34a', label: 'Completado',  bg: '#f0fdf4' },
  CANCELLED:   { color: '#6b7280', label: 'Cancelado',   bg: '#f9fafb' },
  ACTIVE:      { color: '#16a34a', label: 'Activo',      bg: '#f0fdf4' },
  DRAFT:       { color: '#d97706', label: 'Borrador',    bg: '#fffbeb' },
};

@Component({
  selector: 'app-traffic-light',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="traffic-light"
          [style.background]="showLabel ? info.bg : 'transparent'"
          [style.border]="showLabel ? ('1px solid ' + info.color + '44') : 'none'"
          [style.border-radius.px]="showLabel ? 20 : 0"
          [style.padding]="showLabel ? '3px 10px 3px 7px' : '0'"
          [style.display]="'inline-flex'" [style.align-items]="'center'" [style.gap.px]="5">
      <span class="traffic-dot"
            [style.width.px]="showLabel ? 10 : size"
            [style.height.px]="showLabel ? 10 : size"
            [style.border-radius]="'50%'"
            [style.background]="info.color"
            [style.flex-shrink]="'0'"></span>
      @if (showLabel) {
        <span [style.color]="info.color" [style.font-size.px]="12" [style.font-weight]="600">{{ info.label }}</span>
      }
    </span>
  `
})
export class TrafficLightComponent {
  @Input() status = '';
  @Input() size = 10;
  @Input() showLabel = false;

  get info() { return STATUS_MAP[this.status] ?? { color: '#9ca3af', label: this.status, bg: '#f9fafb' }; }
}
