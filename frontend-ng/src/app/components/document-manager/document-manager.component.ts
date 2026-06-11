import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { API_BASE } from '../../api';
import { Client as StompClient } from '@stomp/stompjs';

const WS_BASE = API_BASE.replace('/api', '');

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
interface CollabUser  { userId: string; userName: string; color: string; joinedAt: string; }
interface CollabNote  { userId: string; userName: string; color: string; content: string; timestamp: string; }

const COLLAB_COLORS = ['#722ed1','#1677ff','#52c41a','#fa8c16','#f5222d','#13c2c2','#eb2f96'];

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
            <div style="margin-bottom:8px"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
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
                <span [innerHTML]="safeIcon(doc.contentType)"></span>
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Descargar
                  </button>
                  @if (isViewable(doc.contentType)) {
                    <button (click)="openPreview(doc)" class="btn btn-ghost btn-sm"
                      title="Vista previa" style="display:inline-flex;align-items:center;gap:4px;font-size:12px">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Ver
                    </button>
                  }
                  @if (isCollaborativeEditable(doc.contentType)) {
                    <button (click)="openCollaborative(doc)" class="btn btn-ghost btn-sm"
                      title="Editar colaborativamente" style="font-size:12px;color:#722ed1;display:inline-flex;align-items:center;gap:4px">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Colaborar
                    </button>
                  }
                  <button (click)="showAudit(doc)" class="btn btn-ghost btn-sm"
                    title="Ver historial" style="font-size:12px;display:inline-flex;align-items:center;gap:4px">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Historial
                  </button>
                  @if (canManagePermissions) {
                    <button (click)="openPermissions(doc)" class="btn btn-ghost btn-sm"
                      title="Gestionar permisos" style="font-size:12px;color:#722ed1;display:inline-flex;align-items:center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </button>
                  }
                  @if (canDelete) {
                    <button (click)="deleteDoc(doc)" class="btn btn-ghost btn-sm"
                      title="Eliminar" style="font-size:12px;color:#ff4d4f;display:inline-flex;align-items:center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
                <span [innerHTML]="safeActionIcon(entry.action)"></span>
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
              <div style="margin-bottom:12px" [innerHTML]="safeIcon(previewDoc.contentType, 40)"></div>
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
            <div style="font-weight:700;color:#722ed1;display:flex;align-items:center;gap:6px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Gestión de Permisos
            </div>
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

    <!-- ══ Collaborative editing modal ══════════════════════════════════════ -->
    @if (collabDoc) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:1200;display:flex;flex-direction:column">

        <!-- Top bar -->
        <div style="background:#1a1a2e;padding:10px 20px;display:flex;align-items:center;gap:12px;flex-shrink:0;border-bottom:1px solid #333">
          <span [innerHTML]="safeIcon(collabDoc.contentType, 20)"></span>
          <span style="color:#fff;font-weight:700;font-size:14px;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ collabDoc.fileName }}</span>
          <div style="background:#722ed1;color:#fff;border-radius:10px;padding:2px 10px;font-size:10px;font-weight:700;letter-spacing:.5px">SESIÓN COLABORATIVA EN VIVO</div>

          <!-- User avatars -->
          <div style="display:flex;margin-left:8px">
            @for (u of collabUsers; track u.userId) {
              <div [style.background]="u.color" [title]="u.userName"
                   style="width:32px;height:32px;border-radius:50%;border:2px solid #1a1a2e;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;margin-left:-6px;position:relative;cursor:default">
                {{ u.userName.charAt(0).toUpperCase() }}
                <div style="position:absolute;bottom:1px;right:1px;width:8px;height:8px;background:#52c41a;border-radius:50%;border:1px solid #1a1a2e"></div>
              </div>
            }
          </div>
          <span style="color:#aaa;font-size:12px">{{ collabUsers.length }} en sesión</span>

          <div style="flex:1"></div>
          <button (click)="closeCollaborative()"
                  style="background:#ff4d4f;color:#fff;border:none;border-radius:6px;padding:6px 18px;cursor:pointer;font-size:13px;font-weight:600">
            × Salir
          </button>
        </div>

        <!-- Body -->
        <div style="flex:1;display:flex;overflow:hidden">

          <!-- Document viewer (65%) -->
          <div style="flex:0 0 65%;background:#2d2d2d;display:flex;flex-direction:column;border-right:2px solid #444">
            <div style="padding:6px 14px;background:#222;display:flex;align-items:center;gap:8px;font-size:11px;color:#888;border-bottom:1px solid #333">
              <span>Visor</span>
              @if (collabDocUrl) {
                <a [href]="collabDocUrl" target="_blank" style="color:#91caff;text-decoration:none">↗ Abrir en nueva pestaña</a>
              }
            </div>
            @if (collabDoc.contentType === 'application/pdf') {
              <iframe [src]="safeCollabUrl" style="flex:1;border:none;background:#525659"></iframe>
            } @else if (collabDoc.contentType?.startsWith('image/')) {
              <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px">
                <img [src]="collabDocUrl" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px" />
              </div>
            } @else if (isOfficeDoc(collabDoc.contentType)) {
              <iframe [src]="safeCollabOfficeUrl" style="flex:1;border:none"></iframe>
            } @else {
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#888;gap:16px">
                <div [innerHTML]="safeIcon(collabDoc.contentType, 64)"></div>
                <div style="font-size:14px;color:#aaa">{{ collabDoc.fileName }}</div>
                <a [href]="collabDocUrl" [attr.download]="collabDoc.fileName"
                   style="background:#722ed1;color:#fff;border-radius:8px;padding:10px 24px;text-decoration:none;font-size:13px;display:inline-flex;align-items:center;gap:6px">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Descargar para editar localmente
                </a>
              </div>
            }
          </div>

          <!-- Collaboration panel (35%) -->
          <div style="flex:0 0 35%;background:#fff;display:flex;flex-direction:column">

            <!-- Participants -->
            <div style="padding:10px 14px;border-bottom:1px solid #f0f0f0;background:#fafafa">
              <div style="font-size:10px;font-weight:700;color:#999;letter-spacing:.5px;margin-bottom:6px">PARTICIPANTES EN LÍNEA</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                @for (u of collabUsers; track u.userId) {
                  <div style="display:flex;align-items:center;gap:5px;background:#f0f0f0;border-radius:20px;padding:3px 10px 3px 4px">
                    <div [style.background]="u.color"
                         style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700">
                      {{ u.userName.charAt(0).toUpperCase() }}
                    </div>
                    <span style="font-size:12px;font-weight:600">{{ u.userName }}</span>
                    <div style="width:7px;height:7px;background:#52c41a;border-radius:50%"></div>
                  </div>
                }
                @if (collabUsers.length === 0) {
                  <span style="font-size:12px;color:#bbb">Conectando...</span>
                }
              </div>
            </div>

            <!-- Tabs: Editor / Comentarios -->
            <div style="display:flex;border-bottom:2px solid #f0f0f0;flex-shrink:0">
              <button (click)="collabTab='editor'"
                [style.border-bottom]="collabTab==='editor' ? '2px solid #722ed1' : '2px solid transparent'"
                [style.color]="collabTab==='editor' ? '#722ed1' : '#999'"
                style="flex:1;padding:8px;font-size:12px;font-weight:700;background:none;border:none;cursor:pointer;margin-bottom:-2px">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Editor en vivo
              </button>
              <button (click)="collabTab='notes'"
                [style.border-bottom]="collabTab==='notes' ? '2px solid #1677ff' : '2px solid transparent'"
                [style.color]="collabTab==='notes' ? '#1677ff' : '#999'"
                style="flex:1;padding:8px;font-size:12px;font-weight:700;background:none;border:none;cursor:pointer;margin-bottom:-2px">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Comentarios
              </button>
            </div>

            <!-- Tab: Editor colaborativo en tiempo real -->
            @if (collabTab === 'editor') {
              <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
                <div style="padding:6px 12px;background:#f6f0ff;border-bottom:1px solid #e9d8fd;font-size:11px;color:#722ed1;display:flex;align-items:center;gap:6px">
                  <span style="width:8px;height:8px;background:#52c41a;border-radius:50%;display:inline-block"></span>
                  Edición sincronizada — todos ven los cambios al instante
                  @if (collabEditingUser && collabEditingUser !== myCollabUserId) {
                    <span style="margin-left:auto;font-size:10px;color:#888">{{ collabEditingUser }} editando...</span>
                  }
                </div>
                <textarea
                  [value]="collabEditorContent"
                  (input)="onCollabEditorInput($event)"
                  placeholder="Escribe aquí... todos los participantes ven los cambios en tiempo real."
                  style="flex:1;resize:none;border:none;outline:none;padding:14px;font-size:13px;font-family:monospace;line-height:1.6;background:#fff;color:#222">
                </textarea>
                <div style="padding:6px 12px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:10px;color:#bbb;display:flex;justify-content:space-between">
                  <span>{{ collabEditorContent.length }} caracteres</span>
                  <span>Sincronizado vía WebSocket</span>
                </div>
              </div>
            }

            <!-- Tab: Comentarios/notas -->
            @if (collabTab === 'notes') {
              <div #notesArea style="flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:8px;background:#fafafa">
                <div style="font-size:11px;color:#bbb;text-align:center;margin-bottom:4px">— Comentarios en tiempo real —</div>
                @for (n of collabNotes; track $index) {
                  <div [style.align-self]="n.userId === myCollabUserId ? 'flex-end' : 'flex-start'" style="max-width:88%">
                    @if (n.userId !== myCollabUserId) {
                      <div style="font-size:10px;color:#999;margin-bottom:2px;margin-left:4px">{{ n.userName }}</div>
                    }
                    <div [style.background]="n.userId === myCollabUserId ? n.color : '#e8e8e8'"
                         [style.color]="n.userId === myCollabUserId ? '#fff' : '#333'"
                         style="padding:8px 12px;border-radius:10px;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word">
                      {{ n.content }}
                    </div>
                    <div style="font-size:10px;color:#bbb;margin-top:2px" [style.text-align]="n.userId === myCollabUserId ? 'right' : 'left'">
                      {{ n.timestamp | date:'HH:mm:ss' }}
                    </div>
                  </div>
                }
                @if (collabNotes.length === 0) {
                  <div style="text-align:center;color:#ccc;font-size:12px;margin-top:24px">
                    Sin comentarios aún.<br>Sé el primero en escribir.
                  </div>
                }
              </div>
              <div style="border-top:1px solid #e8e8e8;padding:10px 12px;background:#fff;display:flex;gap:8px">
                <input [(ngModel)]="collabNoteText" class="form-input"
                       placeholder="Escribe un comentario..."
                       style="flex:1;font-size:13px"
                       (keyup.enter)="sendCollabNote()" />
                <button (click)="sendCollabNote()" [disabled]="!collabNoteText.trim()"
                        class="btn btn-primary" style="padding:0 14px;display:inline-flex;align-items:center;justify-content:center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            }
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

  // Collaborative session state
  collabDoc: CaseDocument | null = null;
  collabUsers: CollabUser[] = [];
  collabNotes: CollabNote[] = [];
  collabNoteText = '';
  collabDocUrl = '';
  safeCollabUrl: SafeResourceUrl = '';
  safeCollabOfficeUrl: SafeResourceUrl = '';
  myCollabUserId = '';
  myCollabColor = '';
  collabTab: 'editor' | 'notes' = 'editor';
  collabEditorContent = '';
  collabEditingUser = '';
  private collabEditDebounce: any = null;
  private collabClient: StompClient | null = null;

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
      error: (err: any) => {
        this.uploading = false;
        const msg = err?.status === 413 ? 'Archivo demasiado grande (máx 50 MB)'
                  : err?.status === 401 ? 'Sesión expirada — vuelve a iniciar sesión'
                  : err?.status === 403 ? 'Sin permiso para subir archivos'
                  : `Error al subir el archivo (${err?.status ?? 'sin conexión'})`;
        this.toast.show(msg, 'error');
      }
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
    this.collabDoc = doc;
    this.collabUsers = [];
    this.collabNotes = [];
    this.collabNoteText = '';
    this.collabTab = 'editor';
    this.collabEditorContent = '';
    this.collabEditingUser = '';
    // Load existing editor content
    this.http.get<{ content: string }>(`${API_BASE}/documents/${doc.id}/content`)
      .subscribe({ next: r => { if (r.content) this.collabEditorContent = r.content; }, error: () => {} });

    // Resolve current user info
    const authUser = (this.auth as any).user;
    const userId   = typeof authUser === 'function' ? authUser()?.id  : authUser?.id;
    const userName = typeof authUser === 'function' ? authUser()?.name : authUser?.name;
    this.myCollabUserId = userId ?? 'guest';
    const colorIdx = this.myCollabUserId.charCodeAt(this.myCollabUserId.length - 1) % COLLAB_COLORS.length;
    this.myCollabColor = COLLAB_COLORS[colorIdx];

    // Fetch download URL for the viewer
    this.http.get<{ url: string }>(`${API_BASE}/documents/${doc.id}/download-url`)
      .subscribe({
        next: r => {
          this.collabDocUrl = r.url;
          this.safeCollabUrl = this.sanitizer.bypassSecurityTrustResourceUrl(r.url);
          if (this.isOfficeDoc(doc.contentType)) {
            const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(r.url)}`;
            this.safeCollabOfficeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(officeUrl);
          }
        },
        error: () => {}
      });

    // Connect WebSocket and join session
    this.collabClient = new StompClient({
      brokerURL: `${WS_BASE}/ws/websocket`,
      reconnectDelay: 3000,
      onConnect: () => {
        // Subscribe to session updates (who's connected)
        this.collabClient!.subscribe(`/topic/document/${doc.id}/session`, msg => {
          const update = JSON.parse(msg.body);
          this.collabUsers = update.users ?? [];
          this.scrollNotes();
        });
        // Subscribe to shared notes
        this.collabClient!.subscribe(`/topic/document/${doc.id}/notes`, msg => {
          const note: CollabNote = JSON.parse(msg.body);
          this.collabNotes.push(note);
          setTimeout(() => this.scrollNotes(), 50);
        });
        // Subscribe to real-time editor sync
        this.collabClient!.subscribe(`/topic/document/${doc.id}/edit`, msg => {
          const update = JSON.parse(msg.body);
          if (update.userId !== this.myCollabUserId) {
            this.collabEditorContent = update.content;
            this.collabEditingUser = update.userName;
            setTimeout(() => this.collabEditingUser = '', 2000);
          }
        });
        // Announce presence
        this.collabClient!.publish({
          destination: `/app/document/${doc.id}/join`,
          body: JSON.stringify({
            userId: this.myCollabUserId,
            userName: userName ?? 'Usuario',
            color: this.myCollabColor
          })
        });
      }
    });
    this.collabClient.activate();
    this.toast.show('Sesión colaborativa iniciada', 'success');
  }

  closeCollaborative() {
    if (this.collabClient && this.collabDoc) {
      this.collabClient.publish({
        destination: `/app/document/${this.collabDoc.id}/leave`,
        body: JSON.stringify({ userId: this.myCollabUserId })
      });
      this.collabClient.deactivate();
      this.collabClient = null;
    }
    this.collabDoc = null;
    this.collabUsers = [];
    this.collabNotes = [];
  }

  sendCollabNote() {
    if (!this.collabNoteText.trim() || !this.collabClient || !this.collabDoc) return;
    const authUser = (this.auth as any).user;
    const userName = typeof authUser === 'function' ? authUser()?.name : authUser?.name;
    this.collabClient.publish({
      destination: `/app/document/${this.collabDoc.id}/note`,
      body: JSON.stringify({
        userId: this.myCollabUserId,
        userName: userName ?? 'Usuario',
        color: this.myCollabColor,
        content: this.collabNoteText.trim()
      })
    });
    this.collabNoteText = '';
  }

  onCollabEditorInput(event: Event) {
    this.collabEditorContent = (event.target as HTMLTextAreaElement).value;
    if (!this.collabClient || !this.collabDoc) return;
    // Debounce 300ms para no saturar el WebSocket con cada tecla
    clearTimeout(this.collabEditDebounce);
    this.collabEditDebounce = setTimeout(() => {
      const authUser = (this.auth as any).user;
      const userName = typeof authUser === 'function' ? authUser()?.name : authUser?.name;
      this.collabClient!.publish({
        destination: `/app/document/${this.collabDoc!.id}/edit`,
        body: JSON.stringify({
          userId: this.myCollabUserId,
          userName: userName ?? 'Usuario',
          color: this.myCollabColor,
          content: this.collabEditorContent
        })
      });
    }, 300);
  }

  isOfficeDoc(ct: string): boolean {
    return ct?.includes('word') || ct?.includes('spreadsheet') ||
           ct?.includes('presentation') || ct?.includes('excel') ||
           ct?.includes('powerpoint') || ct?.includes('officedocument');
  }

  private scrollNotes() {
    const el = document.querySelector('[style*="flex-direction:column;gap:8px"]');
    if (el) el.scrollTop = el.scrollHeight;
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
    return this.isOfficeDoc(ct) || ct === 'text/plain' || ct === 'application/rtf' ||
           ct?.startsWith('image/') || ct === 'application/pdf';
  }

  safeIcon(ct: string, size = 22): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.fileIcon(ct, size));
  }

  safeActionIcon(action: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.actionIcon(action));
  }

  fileIcon(ct: string, size = 22): string {
    const s = (path: string, color: string) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8">${path}</svg>`;
    if (!ct) return s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', '#888');
    if (ct.startsWith('image/')) return s('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', '#13c2c2');
    if (ct === 'application/pdf') return s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', '#cf1322');
    if (ct.includes('word') || ct.includes('document')) return s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>', '#1677ff');
    if (ct.includes('sheet') || ct.includes('excel')) return s('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>', '#52c41a');
    if (ct.includes('presentation') || ct.includes('powerpoint')) return s('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>', '#fa8c16');
    if (ct.startsWith('video/')) return s('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>', '#722ed1');
    if (ct.startsWith('audio/')) return s('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', '#eb2f96');
    if (ct.includes('zip') || ct.includes('rar')) return s('<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>', '#8c8c8c');
    return s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', '#888');
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  actionIcon(action: string): string {
    const s = (path: string, color: string) =>
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">${path}</svg>`;
    const map: Record<string, string> = {
      UPLOADED:   s('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', '#52c41a'),
      DOWNLOADED: s('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', '#1677ff'),
      VIEWED:     s('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', '#722ed1'),
      DELETED:    s('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>', '#ff4d4f'),
      MODIFIED:   s('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>', '#fa8c16'),
    };
    return map[action] ?? s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', '#888');
  }

  actionLabel(action: string): string {
    return { UPLOADED: 'Subió el documento', DOWNLOADED: 'Descargó el documento',
             VIEWED: 'Vio el historial', DELETED: 'Eliminó el documento',
             MODIFIED: 'Modificó el documento' }[action] ?? action;
  }
}
