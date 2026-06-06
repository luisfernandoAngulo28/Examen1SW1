import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { API_BASE } from '../../api';

interface CaseDocument {
  id: string;
  caseId: string;
  nodeId: string | null;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedByName: string;
  uploadedAt: string;
  auditLogs: AuditEntry[];
}

interface AuditEntry {
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

interface PermissionEntry { userId: string; level: string; }

@Component({
  selector: 'app-document-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-top:16px">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#f6f0ff,#fdf4ff);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#722ed1" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style="font-weight:700;font-size:14px;color:#722ed1">Documentos del Trámite</span>
          <span style="background:#722ed1;color:#fff;border-radius:10px;padding:1px 8px;font-size:11px;font-weight:600">{{ docs.length }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          @if (permission === 'NONE') {
            <span style="font-size:11px;color:#ff4d4f;background:#fff2f0;border:1px solid #ffccc7;border-radius:4px;padding:2px 8px">Sin acceso</span>
          } @else {
            <span style="font-size:11px;color:#52c41a;background:#f6ffed;border:1px solid #b7eb8f;border-radius:4px;padding:2px 8px">
              {{ permissionLabel }}
            </span>
          }
          @if (canUpload) {
            <label style="background:#722ed1;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Subir archivo
              <input type="file" style="display:none" (change)="onFileSelected($event)" multiple />
            </label>
          }
        </div>
      </div>

      @if (permission === 'NONE') {
        <div style="padding:32px;text-align:center;color:#999;font-size:13px">
          No tienes acceso a los documentos en este punto del flujo.
        </div>
      } @else {

        <!-- Upload progress -->
        @if (uploading) {
          <div style="padding:10px 18px;background:#f0f5ff;border-bottom:1px solid #d6e4ff;display:flex;align-items:center;gap:10px">
            <div class="spinner" style="width:14px;height:14px;border-width:2px"></div>
            <div style="flex:1">
              <div style="font-size:12px;color:#1677ff;margin-bottom:4px">Subiendo {{ uploadingName }}...</div>
              <div style="background:#d6e4ff;border-radius:4px;height:4px">
                <div [style.width.%]="uploadProgress" style="background:#1677ff;height:100%;border-radius:4px;transition:width .2s"></div>
              </div>
            </div>
            <span style="font-size:11px;color:#1677ff">{{ uploadProgress }}%</span>
          </div>
        }

        <!-- Drag & drop zone (only when no docs) -->
        @if (docs.length === 0 && !uploading) {
          <div (dragover)="$event.preventDefault()" (drop)="onDrop($event)"
               style="padding:40px;text-align:center;border:2px dashed #d9d9d9;margin:16px;border-radius:8px;color:#bbb;cursor:pointer">
            <div style="font-size:32px;margin-bottom:8px">📂</div>
            <div style="font-size:13px">No hay documentos aún.</div>
            @if (canUpload) {
              <div style="font-size:12px;margin-top:4px">Arrastra archivos aquí o usa el botón "Subir archivo"</div>
            }
          </div>
        }

        <!-- Document list -->
        @if (docs.length > 0) {
          <div style="padding:8px 0">
            @for (doc of docs; track doc.id) {
              <div style="display:flex;align-items:center;gap:12px;padding:10px 18px;border-bottom:1px solid var(--border);transition:background .15s"
                   (mouseenter)="$any($event.currentTarget).style.background='#fafafa'"
                   (mouseleave)="$any($event.currentTarget).style.background=''">
                <span style="font-size:22px">{{ fileIcon(doc.contentType) }}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ doc.fileName }}</div>
                  <div style="font-size:11px;color:#999">
                    {{ formatSize(doc.fileSize) }} ·
                    Subido por <strong>{{ doc.uploadedByName }}</strong> ·
                    {{ doc.uploadedAt | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0">
                  <button (click)="download(doc)" class="btn btn-ghost btn-sm"
                    title="Descargar" style="display:inline-flex;align-items:center;gap:4px;font-size:12px">
                    ⬇ Descargar
                  </button>
                  @if (isViewable(doc.contentType)) {
                    <button (click)="openPreview(doc)" class="btn btn-ghost btn-sm"
                      title="Vista previa" style="display:inline-flex;align-items:center;gap:4px;font-size:12px">
                      👁 Ver
                    </button>
                  }
                  @if (isCollaborativeEditable(doc.contentType)) {
                    <button (click)="openCollaborative(doc)" class="btn btn-ghost btn-sm"
                      title="Editar colaborativamente" style="font-size:12px;color:#722ed1">
                      ✏ Colaborar
                    </button>
                  }
                  <button (click)="showAudit(doc)" class="btn btn-ghost btn-sm"
                    title="Ver historial" style="font-size:12px">
                    📋 Historial
                  </button>
                  @if (canManagePermissions) {
                    <button (click)="openPermissions(doc)" class="btn btn-ghost btn-sm"
                      title="Gestionar permisos" style="font-size:12px;color:#722ed1">
                      🔐
                    </button>
                  }
                  @if (canDelete) {
                    <button (click)="deleteDoc(doc)" class="btn btn-ghost btn-sm"
                      title="Eliminar" style="font-size:12px;color:#ff4d4f">
                      🗑
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Audit modal -->
    @if (auditDoc) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center"
           (click)="auditDoc=null">
        <div style="background:#fff;border-radius:12px;width:500px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column"
             (click)="$event.stopPropagation()">
          <div style="padding:18px 20px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700">Historial de accesos</div>
              <div style="font-size:12px;color:#999">{{ auditDoc.fileName }}</div>
            </div>
            <button (click)="auditDoc=null" style="background:none;border:none;font-size:20px;cursor:pointer;color:#999">×</button>
          </div>
          <div style="overflow-y:auto;flex:1">
            @for (entry of auditEntries; track $index) {
              <div style="padding:12px 20px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:12px">
                <span style="font-size:18px">{{ actionIcon(entry.action) }}</span>
                <div style="flex:1">
                  <div style="font-size:13px"><strong>{{ entry.userName }}</strong> — {{ actionLabel(entry.action) }}</div>
                  <div style="font-size:11px;color:#999">{{ entry.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</div>
                </div>
              </div>
            }
            @empty {
              <div style="padding:32px;text-align:center;color:#999;font-size:13px">Sin registros de acceso</div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Preview modal -->
    @if (previewDoc) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:1100;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px"
           (click)="closePreview()">
        <div style="display:flex;align-items:center;gap:12px;color:#fff;width:90vw;max-width:1000px">
          <span style="font-size:14px;font-weight:600">{{ previewDoc.fileName }}</span>
          <span style="flex:1"></span>
          <a [href]="previewUrl" target="_blank" style="color:#91caff;font-size:13px;text-decoration:none">↗ Abrir en nueva pestaña</a>
          <button (click)="closePreview()" style="background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:6px;padding:4px 14px;cursor:pointer;font-size:18px">×</button>
        </div>
        <div style="background:#fff;border-radius:10px;overflow:hidden;width:90vw;max-width:1000px;max-height:80vh;display:flex;align-items:center;justify-content:center"
             (click)="$event.stopPropagation()">
          @if (previewDoc.contentType === 'application/pdf') {
            <iframe [src]="previewUrl" style="width:100%;height:80vh;border:none"></iframe>
          } @else if (previewDoc.contentType?.startsWith('image/')) {
            <img [src]="previewUrl" style="max-width:100%;max-height:80vh;object-fit:contain" />
          } @else if (previewDoc.contentType?.startsWith('video/')) {
            <video [src]="previewUrl" controls style="max-width:100%;max-height:80vh"></video>
          } @else {
            <div style="padding:40px;text-align:center;color:#666">
              <div style="font-size:40px;margin-bottom:12px">{{ fileIcon(previewDoc.contentType) }}</div>
              <div>Este formato no tiene vista previa disponible.</div>
              <a [href]="previewUrl" download style="color:#1677ff;margin-top:8px;display:inline-block">Descargar archivo</a>
            </div>
          }
        </div>
      </div>
    }

    <!-- Permissions modal -->
    @if (permissionsDoc) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center"
           (click)="permissionsDoc=null">
        <div style="background:#fff;border-radius:12px;width:480px;overflow:hidden"
             (click)="$event.stopPropagation()">
          <div style="padding:16px 20px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;background:#f6f0ff">
            <div style="font-weight:700;color:#722ed1">🔐 Gestión de Permisos</div>
            <button (click)="permissionsDoc=null" style="background:none;border:none;font-size:20px;cursor:pointer;color:#999">×</button>
          </div>
          <div style="padding:16px 20px">
            <p style="font-size:13px;color:#666;margin-bottom:12px">Asigna permisos por usuario para <strong>{{ permissionsDoc.fileName }}</strong></p>
            <div style="margin-bottom:12px;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
              <input [(ngModel)]="newPermUserId" class="form-input" placeholder="Email o ID de usuario" style="font-size:13px" />
              <select [(ngModel)]="newPermLevel" class="form-input" style="font-size:13px">
                <option value="VIEW">Solo lectura</option>
                <option value="UPLOAD">Puede subir</option>
                <option value="EDIT">Puede editar</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <button (click)="addPermission()" class="btn btn-primary btn-sm" style="width:100%;margin-bottom:16px">+ Agregar permiso</button>
            <div style="border-top:1px solid #f0f0f0;padding-top:12px">
              <div style="font-size:12px;font-weight:600;color:#666;margin-bottom:8px">Permisos actuales:</div>
              @for (entry of permissionsEntries; track entry.userId) {
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:6px 10px;background:#f9f9f9;border-radius:6px">
                  <span style="flex:1;font-size:13px">{{ entry.userId }}</span>
                  <span [style.background]="entry.level==='ADMIN'?'#fff1f0':entry.level==='EDIT'?'#f0f5ff':entry.level==='UPLOAD'?'#f6ffed':'#fafafa'"
                        [style.color]="entry.level==='ADMIN'?'#cf1322':entry.level==='EDIT'?'#1677ff':entry.level==='UPLOAD'?'#52c41a':'#666'"
                        style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;border:1px solid currentColor">
                    {{ entry.level }}
                  </span>
                </div>
              }
              @empty {
                <div style="font-size:12px;color:#999">Sin permisos específicos (acceso por defecto para todos)</div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class DocumentManagerComponent implements OnInit {
  @Input() caseId!: string;
  @Input() nodeId: string | null = null;

  docs: CaseDocument[] = [];
  permission = 'VIEW_EDIT';
  uploading = false;
  uploadProgress = 0;
  uploadingName = '';
  auditDoc: CaseDocument | null = null;
  auditEntries: AuditEntry[] = [];

  // Preview state
  previewDoc: CaseDocument | null = null;
  previewUrl: SafeResourceUrl | string = '';

  // Permissions state
  permissionsDoc: CaseDocument | null = null;
  permissionsEntries: PermissionEntry[] = [];
  newPermUserId = '';
  newPermLevel = 'VIEW';

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  readonly auth = inject(AuthService);

  get canUpload()  { return this.permission === 'VIEW_EDIT' || this.permission === 'FULL' || this.permission === 'UPLOAD' || this.permission === 'EDIT' || this.permission === 'ADMIN'; }
  get canDelete()  { return this.permission === 'FULL' || this.permission === 'ADMIN'; }
  get canManagePermissions() { return this.permission === 'FULL' || this.permission === 'ADMIN'; }
  get permissionLabel() {
    return { VIEW: 'Solo lectura', UPLOAD: 'Puede subir', EDIT: 'Puede editar', VIEW_EDIT: 'Lectura + subida', FULL: 'Acceso completo', ADMIN: 'Administrador' }[this.permission] ?? this.permission;
  }

  ngOnInit() {
    this.loadPermission();
    this.loadDocs();
  }

  loadPermission() {
    if (!this.nodeId) return;
    this.http.get<{ permission: string }>(
      `${API_BASE}/documents/${this.caseId}/permissions/${this.nodeId}`
    ).subscribe({ next: r => this.permission = r.permission, error: () => {} });
  }

  loadDocs() {
    this.http.get<CaseDocument[]>(`${API_BASE}/documents/case/${this.caseId}`)
      .subscribe({ next: d => this.docs = d, error: () => {} });
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) Array.from(files).forEach(f => this.uploadFile(f));
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) Array.from(files).forEach(f => this.uploadFile(f));
  }

  uploadFile(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('caseId', this.caseId);
    if (this.nodeId) fd.append('nodeId', this.nodeId);

    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadingName = file.name;

    this.http.post<CaseDocument>(`${API_BASE}/documents/upload`, fd, {
      reportProgress: true, observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        }
        if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.docs = [event.body!, ...this.docs];
          this.toast.show(`"${file.name}" subido exitosamente`, 'success');
        }
      },
      error: () => { this.uploading = false; this.toast.show('Error al subir el archivo', 'error'); }
    });
  }

  download(doc: CaseDocument) {
    this.http.get<{ url: string; s3Available: boolean }>(
      `${API_BASE}/documents/${doc.id}/download-url`
    ).subscribe({
      next: r => {
        const a = document.createElement('a');
        a.href = r.url; a.download = doc.fileName; a.target = '_blank';
        a.click();
      },
      error: () => this.toast.show('Error al obtener URL de descarga', 'error')
    });
  }

  viewInBrowser(doc: CaseDocument) {
    this.http.get<{ url: string }>(`${API_BASE}/documents/${doc.id}/download-url`)
      .subscribe({ next: r => window.open(r.url, '_blank'), error: () => {} });
  }

  openPreview(doc: CaseDocument) {
    this.http.get<{ url: string }>(`${API_BASE}/documents/${doc.id}/download-url`)
      .subscribe({
        next: r => {
          this.previewDoc = doc;
          this.previewUrl = doc.contentType === 'application/pdf'
            ? this.sanitizer.bypassSecurityTrustResourceUrl(r.url)
            : r.url;
        },
        error: () => this.toast.show('No se pudo obtener la URL de vista previa', 'error')
      });
  }

  closePreview() { this.previewDoc = null; this.previewUrl = ''; }

  openPermissions(doc: CaseDocument) {
    this.permissionsDoc = doc;
    this.permissionsEntries = Object.entries((doc as any).userPermissions ?? {})
      .map(([userId, level]) => ({ userId, level: level as string }));
  }

  addPermission() {
    if (!this.newPermUserId.trim() || !this.permissionsDoc) return;
    const body: Record<string, string> = { [this.newPermUserId.trim()]: this.newPermLevel };
    this.http.put<CaseDocument>(`${API_BASE}/documents/${this.permissionsDoc.id}/user-permissions`, body)
      .subscribe({
        next: updated => {
          Object.assign(this.permissionsDoc!, updated);
          this.permissionsEntries = Object.entries((updated as any).userPermissions ?? {})
            .map(([userId, level]) => ({ userId, level: level as string }));
          this.newPermUserId = '';
          this.toast.show('Permiso asignado correctamente', 'success');
        },
        error: () => this.toast.show('Error al asignar permiso', 'error')
      });
  }

  openCollaborative(doc: CaseDocument) {
    // Collaborative editing via Google Docs Viewer (for Office docs)
    this.http.get<{ url: string }>(`${API_BASE}/documents/${doc.id}/download-url`)
      .subscribe({
        next: r => {
          const docsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(r.url)}&embedded=false`;
          window.open(docsUrl, '_blank');
          this.toast.show('Abriendo con editor colaborativo externo', 'success');
        },
        error: () => {}
      });
  }

  showAudit(doc: CaseDocument) {
    this.auditDoc = doc;
    this.http.get<AuditEntry[]>(`${API_BASE}/documents/${doc.id}/audit`)
      .subscribe({ next: d => this.auditEntries = d.reverse(), error: () => {} });
  }

  deleteDoc(doc: CaseDocument) {
    if (!confirm(`¿Eliminar "${doc.fileName}"? Esta acción no se puede deshacer.`)) return;
    this.http.delete(`${API_BASE}/documents/${doc.id}`).subscribe({
      next: () => { this.docs = this.docs.filter(d => d.id !== doc.id); this.toast.show('Documento eliminado', 'success'); },
      error: () => this.toast.show('Error al eliminar', 'error')
    });
  }

  isViewable(ct: string): boolean {
    return ct?.startsWith('image/') || ct === 'application/pdf';
  }

  isCollaborativeEditable(ct: string): boolean {
    return ct?.includes('word') || ct?.includes('spreadsheet') ||
           ct?.includes('presentation') || ct === 'text/plain' ||
           ct === 'application/rtf';
  }

  fileIcon(ct: string): string {
    if (!ct) return '📄';
    if (ct.startsWith('image/')) return '🖼️';
    if (ct === 'application/pdf') return '📕';
    if (ct.includes('word') || ct.includes('document')) return '📝';
    if (ct.includes('sheet') || ct.includes('excel')) return '📊';
    if (ct.includes('presentation') || ct.includes('powerpoint')) return '📽️';
    if (ct.startsWith('video/')) return '🎬';
    if (ct.startsWith('audio/')) return '🎵';
    if (ct.includes('zip') || ct.includes('rar')) return '🗜️';
    return '📄';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  actionIcon(action: string): string {
    return { UPLOADED: '⬆️', DOWNLOADED: '⬇️', VIEWED: '👁', DELETED: '🗑️', MODIFIED: '✏️' }[action] ?? '📋';
  }

  actionLabel(action: string): string {
    return { UPLOADED: 'Subió el documento', DOWNLOADED: 'Descargó el documento',
             VIEWED: 'Vio el historial', DELETED: 'Eliminó el documento',
             MODIFIED: 'Modificó el documento' }[action] ?? action;
  }
}
