import { Component, inject, OnInit, OnDestroy, NgZone, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { NgxGraphModule, Edge, Node } from '@swimlane/ngx-graph';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form.component';
import { ToastService } from '../../services/toast.service';
import { Client } from '@stomp/stompjs';
import { API_BASE } from '../../api';

const WS_BASE = API_BASE.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');
import { createWorker } from 'tesseract.js';

// Extend window type for SpeechRecognition
declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

interface Dept { id: string; name: string; }
interface PolicyNode { id: string; title: string; nodeType: string; departmentId: string; positionX: number; positionY: number; department?: { name: string }; }
interface PolicyEdge { id: string; fromNodeId: string; toNodeId: string; flowType: string; conditionLabel?: string; }
interface AiResponse { action: string; suggestion: string; nodes?: { title: string; department: string }[]; connections?: { from: string; to: string; flowType: string }[]; }
interface EditorUser { userId: string; userName: string; color: string; joinedAt: string; }

const EDITOR_COLORS = ['#722ed1','#1677ff','#52c41a','#fa8c16','#eb2f96','#13c2c2','#faad14'];

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function nodeColor(type: string) {
  const map: Record<string, string> = { INITIAL: '#52c41a', FINAL: '#ff4d4f', DECISION: '#faad14', FORK: '#722ed1', JOIN: '#13c2c2', ACTION: '#1677ff' };
  return map[type] || '#1677ff';
}

@Component({
  selector: 'app-policy-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxGraphModule, DynamicFormComponent],
  template: `
    <div class="page-header">
      <div>
        <a routerLink="/" style="font-size:13px">← Dashboard</a>
        <h1 style="margin-top:4px">Editor: {{ policyName }}</h1>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <!-- Avatares de presencia colaborativa -->
        @if (editorUsers.length > 0) {
          <div style="display:flex;align-items:center;gap:4px">
            @for (u of editorUsers; track u.userId) {
              <div [title]="u.userName + ' está editando'"
                   style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;border:2px solid #fff;box-shadow:0 0 0 2px #52c41a;cursor:default;position:relative"
                   [style.background]="u.color">
                {{ u.userName.charAt(0).toUpperCase() }}
                <span style="position:absolute;bottom:-2px;right:-2px;width:9px;height:9px;border-radius:50%;background:#52c41a;border:1px solid #fff"></span>
              </div>
            }
            <span style="font-size:11px;color:var(--text-secondary);margin-left:2px">
              {{ editorUsers.length + 1 }} editando
            </span>
          </div>
        }
        <span class="badge" [class]="wsConnected ? 'badge-green' : 'badge-red'" style="font-size:11px;padding:3px 8px">
          {{ wsConnected ? '● En vivo' : '○ Sin WS' }}
        </span>
        <button (click)="exportDiagramPng()" class="btn btn-ghost" style="display:inline-flex;align-items:center;gap:4px" title="Exportar diagrama como PNG">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar PNG
        </button>
        <button (click)="save()" class="btn btn-primary" [disabled]="saving" style="display:inline-flex;align-items:center;gap:4px">
          @if (!saving) { <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> }
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:260px 1fr 300px;gap:0;height:calc(100vh - 120px)">

      <!-- Left panel: node controls -->
      <div style="background:var(--bg-secondary);border-right:1px solid var(--border);padding:16px;overflow-y:auto">
        <h3 style="font-size:13px;font-weight:700;margin-bottom:12px">Agregar Nodo</h3>
        <div style="margin-bottom:10px">
          <label class="form-label">Tipo</label>
          <select [(ngModel)]="newNodeType" class="form-input">
            <option value="ACTION">Actividad (ACTION)</option>
            <option value="DECISION">Decisión (DECISION)</option>
            <option value="FORK">Fork (paralelo)</option>
            <option value="JOIN">Join (unión)</option>
            <option value="INITIAL">Inicio</option>
            <option value="FINAL">Fin</option>
          </select>
        </div>
        @if (!isAutoName) {
          <div style="margin-bottom:10px">
            <label class="form-label">Nombre</label>
            <div style="display:flex;gap:4px">
              <input [(ngModel)]="newNodeTitle" class="form-input" placeholder="Nombre de la actividad" style="flex:1" />
              <button type="button" (click)="voiceNodeTitle()" class="btn btn-ghost btn-sm"
                [style.color]="listeningNodeTitle ? '#ff4d4f' : ''"
                [style.border]="listeningNodeTitle ? '1px solid #ff4d4f' : ''"
                title="Dictar nombre por voz" style="display:inline-flex;align-items:center">
                @if (listeningNodeTitle) {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4d4f" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
                } @else {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                }
              </button>
            </div>
          </div>
        }
        <div style="margin-bottom:12px">
          <label class="form-label">Departamento</label>
          <select [(ngModel)]="selectedDept" class="form-input">
            @for (d of departments; track d.id) { <option [value]="d.id">{{ d.name }}</option> }
          </select>
        </div>
        <button (click)="addNode()" class="btn btn-primary btn-sm" style="width:100%">+ Agregar</button>

        <hr style="margin:16px 0;border-color:var(--border)">

        <h3 style="font-size:13px;font-weight:700;margin-bottom:8px">Tipo de Conexión</h3>
        <select [(ngModel)]="selectedFlowType" class="form-input" style="margin-bottom:10px">
          <option value="SEQUENTIAL">Secuencial</option>
          <option value="CONDITIONAL">Condicional</option>
          <option value="PARALLEL">Paralelo</option>
        </select>
        <p style="font-size:11px;color:var(--text-secondary)">Selecciona tipo antes de conectar nodos arrastrando en el diagrama.</p>

        <hr style="margin:16px 0;border-color:var(--border)">

        <h3 style="font-size:13px;font-weight:700;margin-bottom:8px">Leyenda</h3>
        @for (t of nodeTypes; track t.type) {
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:12px">
            <span [style.background]="t.color" style="display:inline-block;width:12px;height:12px;border-radius:2px"></span>{{ t.type }}
          </div>
        }
      </div>

      <!-- Graph area -->
      <div style="background:#f8fafc;height:100%;display:flex;flex-direction:column">

        <!-- View toggle bar -->
        <div style="flex-shrink:0;display:flex;gap:8px;align-items:center;padding:7px 12px;border-bottom:1px solid var(--border);background:var(--bg-secondary)">
          <span style="font-size:12px;font-weight:600;color:var(--text-secondary)">Vista:</span>
          <button [class]="'btn btn-sm '+(viewMode==='lanes'?'btn-primary':'btn-ghost')" (click)="viewMode='lanes'" style="display:inline-flex;align-items:center;gap:4px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="9"/><line x1="9" y1="15" x2="9" y2="21"/></svg>
            Calles
          </button>
          <button [class]="'btn btn-sm '+(viewMode==='graph'?'btn-primary':'btn-ghost')" (click)="viewMode='graph';graphUpdate$.next(true)" style="display:inline-flex;align-items:center;gap:4px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Grafo libre
          </button>
        </div>

        <!-- Swim lane view -->
        @if (viewMode === 'lanes') {
          <div style="flex:1;overflow:auto">
            @if (!laneViewData) {
              <div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:var(--text-secondary)">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.35"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M5 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/></svg>
                <p>Agrega nodos desde el panel izquierdo</p>
              </div>
            } @else {
              <svg [attr.width]="laneViewData.svgW" [attr.height]="laneViewData.svgH" style="display:block">
                <defs>
                  <marker id="arrowhl" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#64748b"/>
                  </marker>
                </defs>
                @for (dept of laneViewData.depts; track dept; let i = $index) {
                  <rect [attr.x]="0" [attr.y]="i * laneViewData.LANE_H" [attr.width]="laneViewData.svgW" [attr.height]="laneViewData.LANE_H" [attr.fill]="i % 2 === 0 ? '#f8fafc' : '#eef2f7'" stroke="#cbd5e1" stroke-width="1"/>
                  <rect [attr.x]="0" [attr.y]="i * laneViewData.LANE_H" [attr.width]="laneViewData.HDR_W" [attr.height]="laneViewData.LANE_H" fill="#1e293b" stroke="#334155" stroke-width="1"/>
                  <text [attr.x]="laneViewData.HDR_W / 2" [attr.y]="i * laneViewData.LANE_H + laneViewData.LANE_H / 2" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12" font-weight="600" style="font-family:sans-serif">{{ dept }}</text>
                  <line [attr.x1]="laneViewData.HDR_W" [attr.y1]="i * laneViewData.LANE_H" [attr.x2]="laneViewData.HDR_W" [attr.y2]="(i+1) * laneViewData.LANE_H" stroke="#475569" stroke-width="2"/>
                }
                @for (e of laneViewData.edges; track e.id) {
                  <path [attr.d]="e.d" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrowhl)"/>
                  @if (e.label) {
                    <text [attr.x]="e.midX" [attr.y]="e.midY - 6" text-anchor="middle" font-size="10" fill="#475569" style="font-family:sans-serif">{{ e.label }}</text>
                  }
                }
                @for (n of laneViewData.nodes; track n.id) {
                  @if (n.nodeType === 'INITIAL') {
                    <circle [attr.cx]="n.cx" [attr.cy]="n.cy" r="22" fill="#52c41a"/>
                    <text [attr.x]="n.cx" [attr.y]="n.cy" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14" style="font-family:sans-serif">▶</text>
                  } @else if (n.nodeType === 'FINAL') {
                    <circle [attr.cx]="n.cx" [attr.cy]="n.cy" r="22" fill="#ff4d4f"/>
                    <circle [attr.cx]="n.cx" [attr.cy]="n.cy" r="14" fill="none" stroke="white" stroke-width="3"/>
                  } @else if (n.nodeType === 'DECISION') {
                    <polygon [attr.points]="n.cx+','+(n.cy-26)+' '+(n.cx+54)+','+n.cy+' '+n.cx+','+(n.cy+26)+' '+(n.cx-54)+','+n.cy" fill="#faad14"/>
                    <text [attr.x]="n.cx" [attr.y]="n.cy" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="10" font-weight="600" style="font-family:sans-serif">{{ n.label | slice:0:12 }}</text>
                  } @else if (n.nodeType === 'FORK' || n.nodeType === 'JOIN') {
                    <rect [attr.x]="n.cx-52" [attr.y]="n.cy-12" width="104" height="24" [attr.fill]="n.nodeType==='FORK'?'#722ed1':'#13c2c2'" rx="4"/>
                    <text [attr.x]="n.cx" [attr.y]="n.cy" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="10" font-weight="600" style="font-family:sans-serif">{{ n.nodeType }}</text>
                  } @else {
                    <rect [attr.x]="n.x" [attr.y]="n.y" width="140" height="46" fill="#1677ff" rx="6"/>
                    <text [attr.x]="n.cx" [attr.y]="n.cy" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="600" style="font-family:sans-serif">{{ n.label | slice:0:16 }}</text>
                  }
                }
              </svg>
            }
          </div>
        }

        <!-- Free graph (ngx-graph) -->
        @if (viewMode === 'graph') {
          <div style="flex:1;position:relative;overflow:hidden">
            <ngx-graph
                [links]="graphLinks"
                [nodes]="graphNodes"
                [update$]="graphUpdate$"
                [autoCenter]="true"
                [autoZoom]="true"
                [enableZoom]="true"
                [draggingEnabled]="true"
                layout="dagre"
                (select)="onNodeSelect($event)"
                style="width:100%;height:100%">
              <ng-template #nodeTemplate let-node>
                <svg:g class="node">
                  <svg:rect
                    [attr.width]="node.dimension?.width || 140"
                    [attr.height]="node.dimension?.height || 50"
                    [attr.fill]="nodeColor(node.data?.nodeType)"
                    rx="8" ry="8" opacity="0.9" />
                  <svg:text
                    [attr.x]="(node.dimension?.width || 140) / 2"
                    [attr.y]="(node.dimension?.height || 50) / 2"
                    dominant-baseline="middle"
                    text-anchor="middle"
                    fill="white" font-size="12" font-weight="600">
                    {{ node.label | slice:0:20 }}
                  </svg:text>
                  <svg:text
                    [attr.x]="(node.dimension?.width || 140) / 2"
                    [attr.y]="(node.dimension?.height || 50) - 8"
                    text-anchor="middle"
                    fill="rgba(255,255,255,0.75)" font-size="9">
                    {{ node.data?.deptName }}
                  </svg:text>
                </svg:g>
              </ng-template>
              <ng-template #linkTemplate let-link>
                <svg:g class="edge">
                  <svg:path [attr.d]="link.line" stroke="#94a3b8" stroke-width="2" fill="none" marker-end="url(#arrow)" />
                  @if (link.label) {
                    <svg:text font-size="10" fill="#555">
                      <svg:textPath [attr.href]="'#' + link.id">{{ link.label }}</svg:textPath>
                    </svg:text>
                  }
                </svg:g>
              </ng-template>
            </ngx-graph>
            @if (graphNodes.length === 0) {
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--text-secondary);pointer-events:none">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.35"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M5 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/></svg>
                <p>Agrega nodos desde el panel izquierdo</p>
              </div>
            }
            @if (selectedNodeId) {
              <div style="position:absolute;top:16px;right:16px;background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;min-width:200px;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
                <p style="font-size:13px;font-weight:600;margin-bottom:10px">Nodo seleccionado</p>
                <button (click)="deleteNode()" class="btn btn-danger btn-sm" style="width:100%;margin-bottom:8px;display:inline-flex;align-items:center;justify-content:center;gap:4px">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Eliminar nodo
                </button>
                <button (click)="openFormEditor()" class="btn btn-ghost btn-sm" style="width:100%;display:inline-flex;align-items:center;justify-content:center;gap:4px">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar formulario
                </button>
                <button (click)="selectedNodeId=''" class="btn btn-ghost btn-sm" style="width:100%;margin-top:4px;display:inline-flex;align-items:center;justify-content:center;gap:4px">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Deseleccionar
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Right panel: AI + Form editor -->
      <div style="border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden">
        <!-- Tabs -->
        <div style="display:flex;border-bottom:1px solid var(--border)">
          <button [class]="'btn btn-sm ' + (rightTab==='ai' ? 'btn-primary' : 'btn-ghost')" style="flex:1;border-radius:0;display:inline-flex;align-items:center;justify-content:center;gap:4px" (click)="rightTab='ai'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
            AI
          </button>
          <button [class]="'btn btn-sm ' + (rightTab==='form' ? 'btn-primary' : 'btn-ghost')" style="flex:1;border-radius:0;display:inline-flex;align-items:center;justify-content:center;gap:4px" (click)="rightTab='form'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Formulario
          </button>
        </div>

        <!-- AI Panel -->
        @if (rightTab === 'ai') {
          <div style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px">
            @for (msg of aiMessages; track $index; let idx = $index) {
              <div [style.text-align]="msg.role === 'user' ? 'right' : 'left'">
                <div [style.background]="msg.role === 'user' ? 'var(--primary)' : '#f1f5f9'"
                     [style.color]="msg.role === 'user' ? '#fff' : '#222'"
                     style="display:inline-block;padding:8px 12px;border-radius:10px;max-width:85%;font-size:13px">
                  {{ msg.text }}
                </div>
                @if (msg.role === 'ai') {
                  <div style="margin-top:3px">
                    <button (click)="speakMessage(msg.text, idx)" class="btn btn-ghost btn-sm"
                      style="padding:1px 7px;font-size:11px;border-radius:4px;display:inline-flex;align-items:center;gap:3px"
                      [title]="speakingIdx === idx ? 'Detener (ElevenLabs TTS)' : 'Escuchar respuesta (ElevenLabs TTS)'">
                      @if (speakingIdx === idx) {
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"/></svg> Detener
                      } @else {
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Escuchar
                      }
                    </button>
                  </div>
                }
              </div>
            }
          </div>
          <div style="padding:10px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:6px">
            <textarea [(ngModel)]="aiPrompt" rows="3" class="form-input" placeholder="Describe el proceso o dicta por voz..." style="resize:none;font-size:13px"></textarea>
            <div style="display:flex;gap:6px">
              <button (click)="startVoiceAi()" class="btn btn-sm"
                [class]="listeningAi ? 'btn-danger' : 'btn-ghost'"
                [title]="listeningAi ? 'Grabando... clic para parar' : 'Dictar por voz'"
                style="padding:6px 12px;display:inline-flex;align-items:center;gap:4px">
                @if (listeningAi) {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg> Grabando...
                } @else {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Voz
                }
              </button>
              <button (click)="fileInput.click()" class="btn btn-ghost btn-sm"
                [disabled]="ocrLoading"
                title="Subir imagen o foto de diagrama (OCR)"
                style="padding:6px 12px;display:inline-flex;align-items:center;gap:4px">
                @if (ocrLoading) {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> {{ ocrProgress }}%
                } @else {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> OCR
                }
              </button>
              <input #fileInput type="file" accept="image/*" style="display:none" (change)="uploadImage($event)" />
              <button (click)="sendAiPrompt()" class="btn btn-primary btn-sm" [disabled]="aiLoading || ocrLoading" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:4px">
                @if (!aiLoading) { <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> }
                {{ aiLoading ? '...' : 'Enviar' }}
              </button>
            </div>
            @if (voiceError) {
              <p style="font-size:11px;color:var(--danger);margin:0">{{ voiceError }}</p>
            }
            @if (ocrLoading) {
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:8px;font-size:12px;color:#0369a1">
                Leyendo imagen con OCR... {{ ocrProgress }}%
                <div style="background:#e0f2fe;border-radius:4px;height:4px;margin-top:4px">
                  <div [style.width.%]="ocrProgress" style="background:#0284c7;height:4px;border-radius:4px;transition:width 0.3s"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Form editor -->
        @if (rightTab === 'form') {
          <div style="flex:1;overflow-y:auto;padding:14px">
            @if (!selectedNodeId) {
              <p style="color:var(--text-secondary);font-size:13px;text-align:center;margin-top:32px">Selecciona un nodo del diagrama para editar su formulario</p>
            } @else {
              <h4 style="font-size:13px;font-weight:700;margin-bottom:12px">Formulario para: {{ selectedNodeTitle }}</h4>
              <div style="margin-bottom:10px">
                @for (field of formFields; track $index; let i = $index) {
                  <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;background:#f8fafc;padding:8px;border-radius:6px">
                    <input [(ngModel)]="field.label" placeholder="Etiqueta" class="form-input" style="flex:2;font-size:12px" />
                    <select [(ngModel)]="field.type" class="form-input" style="flex:1;font-size:11px">
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="date">Fecha</option>
                      <option value="textarea">Párrafo</option>
                      <option value="select">Selección</option>
                      <option value="grid">Grid (tabla)</option>
                      <option value="button">Botón acción</option>
                    </select>
                    @if (field.type === 'grid') {
                      <input [(ngModel)]="field.columns" placeholder="Col1,Col2,Col3"
                        class="form-input" style="flex:2;font-size:11px" title="Columnas separadas por coma" />
                    }
                    @if (field.type === 'button') {
                      <input [(ngModel)]="field.buttonLabel" placeholder="Texto del botón"
                        class="form-input" style="flex:2;font-size:11px" />
                    }
                    <button (click)="removeField(i)" class="btn btn-danger btn-sm" style="padding:4px 8px;display:inline-flex;align-items:center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                }
              </div>
              <button (click)="addField()" class="btn btn-ghost btn-sm" style="width:100%;margin-bottom:12px">+ Campo</button>
              <button (click)="saveForm()" class="btn btn-primary btn-sm" [disabled]="savingForm" style="width:100%;display:inline-flex;align-items:center;justify-content:center;gap:4px">
                @if (!savingForm) { <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> }
                {{ savingForm ? 'Guardando...' : 'Guardar formulario' }}
              </button>

              <!-- Document permissions section -->
              <hr style="margin:16px 0;border-color:var(--border)">
              <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#722ed1" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span style="color:#722ed1">Acceso a documentos en este nodo</span>
              </h4>
              <select [(ngModel)]="nodeDocPermission" class="form-input" style="margin-bottom:4px" (ngModelChange)="onDocPermChange($event)">
                <option value="NONE">Sin acceso — los funcionarios no ven documentos</option>
                <option value="VIEW">Solo ver — pueden visualizar, no subir</option>
                <option value="VIEW_EDIT">Ver y modificar — pueden subir archivos</option>
                <option value="FULL">Acceso completo — pueden subir y eliminar</option>
              </select>
              <p style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">Este permiso se guarda al presionar <strong>Guardar</strong> en el encabezado.</p>

              <!-- SLA section -->
              <hr style="margin:16px 0;border-color:var(--border)">
              <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d48806" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style="color:#d48806">Tiempo límite por nodo (SLA)</span>
              </h4>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
                <input type="number" [(ngModel)]="nodeSlaHours" min="1" max="720"
                  placeholder="Sin límite" class="form-input" style="width:110px;font-size:13px"
                  (ngModelChange)="onSlaChange($event)" />
                <span style="font-size:12px;color:var(--text-secondary)">horas</span>
              </div>
              <p style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">
                Si la tarea supera este tiempo, el dashboard la marca en rojo para reasignación a otro funcionario.
                Se guarda al presionar <strong>Guardar</strong>.
              </p>

              <!-- Voice form fill toggle -->
              <hr style="margin:16px 0;border-color:var(--border)">
              <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                <span style="color:#1677ff">Formulario por voz</span>
              </h4>
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:6px">
                <input type="checkbox" [(ngModel)]="nodeVoiceEnabled" (ngModelChange)="onVoiceEnabledChange($event)" style="width:16px;height:16px" />
                <span style="font-size:13px">Habilitar llenado por voz en este nodo</span>
              </label>
              <p style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">
                El funcionario podrá dictar su descripción y la IA llenará el formulario automáticamente.
                Se guarda al presionar <strong>Guardar</strong>.
              </p>

              <!-- Requirements section -->
              <hr style="margin:16px 0;border-color:var(--border)">
              <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                <span>📋 Requisitos del trámite</span>
                <span style="font-size:10px;color:#999;font-weight:400">(documentos que pide el agente)</span>
              </h4>
              @for (req of nodeRequirements; track $index; let ri = $index) {
                <div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;padding:10px;margin-bottom:8px">
                  <div style="display:flex;gap:6px;margin-bottom:6px">
                    <input [(ngModel)]="req.name" placeholder="Nombre del requisito" class="form-input" style="flex:1;font-size:12px" />
                    <button (click)="removeRequirement(ri)" class="btn btn-danger btn-sm" style="padding:4px 8px">✕</button>
                  </div>
                  <input [(ngModel)]="req.description" placeholder="Instrucción para el cliente (opcional)" class="form-input" style="width:100%;font-size:12px;margin-bottom:6px" />
                  <label style="font-size:12px;display:flex;align-items:center;gap:6px;cursor:pointer">
                    <input type="checkbox" [(ngModel)]="req.required" />
                    Obligatorio
                  </label>
                </div>
              }
              <button (click)="addRequirement()" class="btn btn-ghost btn-sm" style="width:100%;margin-bottom:8px;border-color:#ffe58f;color:#d48806">
                + Agregar requisito
              </button>
              <button (click)="saveRequirements()" class="btn btn-sm" style="width:100%;background:#faad14;color:#fff;border:none">
                Guardar requisitos
              </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PolicyEditorComponent implements OnInit, OnDestroy {
  policyName = '';
  departments: Dept[] = [];
  graphNodes: Node[] = [];
  graphLinks: Edge[] = [];
  newNodeType = 'ACTION';
  newNodeTitle = '';
  selectedDept = '';
  saving = false;
  selectedNodeId = '';
  selectedNodeTitle = '';
  formFields: { name: string; label: string; type: string; required: boolean; columns?: string; buttonLabel?: string }[] = [];
  nodeRequirements: { name: string; description: string; required: boolean }[] = [];
  nodeDocPermission = 'VIEW_EDIT';
  nodeSlaHours: number | null = null;
  nodeVoiceEnabled = false;
  savingForm = false;
  rightTab: 'ai' | 'form' = 'ai';
  aiPrompt = '';
  aiMessages: { role: 'user' | 'ai'; text: string }[] = [];
  aiLoading = false;
  ocrLoading = false;
  ocrProgress = 0;
  selectedFlowType = 'SEQUENTIAL';
  listeningAi = false;
  listeningNodeTitle = false;
  voiceError = '';
  graphUpdate$ = new Subject<boolean>();
  viewMode: 'graph' | 'lanes' = 'lanes';
  laneViewData: any = null;
  wsConnected = false;
  editorUsers: EditorUser[] = [];
  private myEditorUserId = uuid();
  private myEditorColor = EDITOR_COLORS[Math.floor(Math.random() * EDITOR_COLORS.length)];
  speakingIdx: number | null = null;
  private stompClient?: Client;
  private currentAudio: HTMLAudioElement | null = null;

  readonly nodeTypes = [
    { type: 'ACTION',    color: '#1677ff' },
    { type: 'DECISION',  color: '#faad14' },
    { type: 'MERGE',     color: '#fa8c16' },
    { type: 'FORK',      color: '#722ed1' },
    { type: 'JOIN',      color: '#13c2c2' },
    { type: 'INITIAL',   color: '#52c41a' },
    { type: 'FINAL',     color: '#ff4d4f' },
  ];

  get isAutoName() { return ['INITIAL', 'FINAL', 'FORK', 'JOIN'].includes(this.newNodeType); }

  private policyId = '';
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private zone = inject(NgZone);
  private recognition: any = null;

  nodeColor = nodeColor;

  ngOnInit() {
    this.policyId = this.route.snapshot.paramMap.get('id')!;
    this.connectEditorWs();
    // Load departments first so dept names are available when mapping policy nodes
    this.http.get<Dept[]>(`${API_BASE}/departments`).subscribe(d => {
      this.departments = d;
      if (d.length) this.selectedDept = d[0].id;
      this._loadPolicy();
    });
  }

  private _mapNode(n: any, index: number): Node {
    const deptName = this.departments.find(d => d.id === n.departmentId)?.name
      || n.department?.name || 'General';
    const px = n.positionX || 100 + index * 180;
    const py = n.positionY || 100 + (index % 3) * 120;
    return {
      id: n.id || uuid(),
      label: n.title || n.nodeType,
      data: { nodeType: n.nodeType, deptName, departmentId: n.departmentId, positionX: px, positionY: py, documentPermission: n.documentPermission || 'VIEW_EDIT', slaHours: n.slaHours ?? null, voiceEnabled: n.voiceEnabled ?? false },
      dimension: { width: 140, height: 50 },
      position: { x: px, y: py },
    };
  }

  private _loadPolicy() {
    this.http.get<any>(`${API_BASE}/policies/${this.policyId}`).subscribe(p => {
      this.policyName = p.name;
      this.graphNodes = (p.nodes || []).map((n: any, i: number) => this._mapNode(n, i));
      this.graphLinks = (p.edges || []).map((e: any) => ({
        id: e.id || uuid(),
        source: e.fromNodeId,
        target: e.toNodeId,
        label: e.conditionLabel || (e.flowType !== 'SEQUENTIAL' ? e.flowType : ''),
        data: { flowType: e.flowType, conditionLabel: e.conditionLabel },
      }));
      this.laneViewData = this.computeLaneView();
      setTimeout(() => this.graphUpdate$.next(true), 50);
    });
  }

  addNode() {
    const defaults: Record<string, string> = { INITIAL: 'Inicio', FINAL: 'Fin', FORK: 'Fork', JOIN: 'Join' };
    const title = this.newNodeTitle.trim() || defaults[this.newNodeType] || '';
    if (!title) { this.toast.show('Ingresa un nombre para el nodo', 'error'); return; }
    const dept = this.departments.find(d => d.id === this.selectedDept);
    const id = uuid();
    const idx = this.graphNodes.length;
    const newNode: Node = {
      id,
      label: title,
      data: { nodeType: this.newNodeType, deptName: dept?.name || '', departmentId: this.selectedDept, positionX: 100 + idx * 180, positionY: 100 + (idx % 3) * 120 },
      dimension: { width: 140, height: 50 },
    };
    this.graphNodes = [...this.graphNodes, newNode];
    this.newNodeTitle = '';
    this.laneViewData = this.computeLaneView();
    setTimeout(() => this.graphUpdate$.next(true), 50);
  }

  deleteNode() {
    if (!this.selectedNodeId) return;
    this.graphNodes = this.graphNodes.filter(n => n.id !== this.selectedNodeId);
    this.graphLinks = this.graphLinks.filter(l => l.source !== this.selectedNodeId && l.target !== this.selectedNodeId);
    this.selectedNodeId = '';
    this.selectedNodeTitle = '';
    this.laneViewData = this.computeLaneView();
  }

  onNodeSelect(node: any) {
    if (!node?.id) return;
    this.selectedNodeId = node.id;
    this.selectedNodeTitle = node.label;
    const n = this.graphNodes.find(g => g.id === node.id);
    if (n?.data?.['nodeId']) {
      this.http.get<any>(`${API_BASE}/forms/template/${n.id}`).subscribe({ next: t => { if (t?.schemaJson) this.parseFormSchema(t.schemaJson); }, error: () => {} });
    }
    // Load requirements for this node
    this.http.get<any>(`${API_BASE}/policies/${this.policyId}`).subscribe({
      next: policy => {
        const node_ = policy.nodes?.find((nd: any) => nd.id === this.selectedNodeId);
        this.nodeRequirements = (node_?.requirements ?? []).map((r: any) => ({
          name: r.name ?? '', description: r.description ?? '', required: r.required ?? true
        }));
        this.nodeDocPermission = node_?.documentPermission ?? 'VIEW_EDIT';
        this.nodeSlaHours = node_?.slaHours ?? null;
        this.nodeVoiceEnabled = node_?.voiceEnabled ?? false;
        // Keep graphNodes in sync so save() picks up the persisted values
        this.graphNodes = this.graphNodes.map(gn =>
          gn.id === this.selectedNodeId
            ? { ...gn, data: { ...gn.data, documentPermission: this.nodeDocPermission, slaHours: this.nodeSlaHours, voiceEnabled: this.nodeVoiceEnabled } }
            : gn
        );
      },
      error: () => { this.nodeRequirements = []; }
    });
  }

  openFormEditor() { this.rightTab = 'form'; }

  addField() { this.formFields.push({ name: `field_${Date.now()}`, label: '', type: 'text', required: false }); }
  removeField(i: number) { this.formFields.splice(i, 1); }

  addRequirement() { this.nodeRequirements.push({ name: '', description: '', required: true }); }
  removeRequirement(i: number) { this.nodeRequirements.splice(i, 1); }

  onDocPermChange(perm: string) {
    this.graphNodes = this.graphNodes.map(n =>
      n.id === this.selectedNodeId
        ? { ...n, data: { ...n.data, documentPermission: perm } }
        : n
    );
  }

  onSlaChange(hours: number | null) {
    this.graphNodes = this.graphNodes.map(n =>
      n.id === this.selectedNodeId
        ? { ...n, data: { ...n.data, slaHours: hours } }
        : n
    );
  }

  onVoiceEnabledChange(enabled: boolean) {
    this.graphNodes = this.graphNodes.map(n =>
      n.id === this.selectedNodeId
        ? { ...n, data: { ...n.data, voiceEnabled: enabled } }
        : n
    );
  }

  saveRequirements() {
    if (!this.selectedNodeId) return;
    this.http.put(`${API_BASE}/policies/${this.policyId}/nodes/${this.selectedNodeId}/requirements`,
      { requirements: this.nodeRequirements }
    ).subscribe({
      next: () => this.toast.show('Requisitos guardados', 'success'),
      error: () => this.toast.show('Error al guardar requisitos', 'error')
    });
  }

  saveForm() {
    if (!this.selectedNodeId) return;
    this.savingForm = true;
    const schema = {
      fields: this.formFields.map(f => ({
        ...f,
        name: f.label.toLowerCase().replace(/\s+/g, '_') || f.name,
        columns: f.type === 'grid' && f.columns ? f.columns.split(',').map((c: string) => c.trim()).filter(Boolean) : undefined,
        buttonLabel: f.type === 'button' ? (f.buttonLabel || f.label) : undefined,
      }))
    };
    this.http.put(`${API_BASE}/forms/template/${this.selectedNodeId}`, { schemaJson: JSON.stringify(schema) }).subscribe({
      next: () => { this.toast.show('Formulario guardado', 'success'); this.savingForm = false; },
      error: () => { this.toast.show('Error al guardar formulario', 'error'); this.savingForm = false; }
    });
  }

  parseFormSchema(schemaJson: any) {
    try {
      const s = typeof schemaJson === 'string' ? JSON.parse(schemaJson) : schemaJson;
      this.formFields = (s.fields || []).map((f: any) => ({
        name: f.name, label: f.label, type: f.type || 'text', required: !!f.required,
        columns: Array.isArray(f.columns) ? f.columns.join(',') : (f.columns || ''),
        buttonLabel: f.buttonLabel || '',
      }));
    } catch { this.formFields = []; }
  }

  exportDiagramPng() {
    const svgEl = (document.querySelector('svg[style*="background"]')
               || document.querySelector('svg')) as SVGSVGElement | null;
    if (!svgEl) { this.toast.show('Cambia a vista de swim lanes para exportar', 'info'); return; }

    const w = svgEl.viewBox?.baseVal?.width  || svgEl.getBoundingClientRect().width  || 1200;
    const h = svgEl.viewBox?.baseVal?.height || svgEl.getBoundingClientRect().height || 600;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    const canvas = document.createElement('canvas');
    canvas.width = w * 2; canvas.height = h * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.scale(2, 2); ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${(this.policyName || 'diagrama').replace(/\s+/g,'_')}.png`;
      a.click();
      this.toast.show('Diagrama exportado como PNG', 'success');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml' }));
      a.download = `${(this.policyName || 'diagrama').replace(/\s+/g,'_')}.svg`;
      a.click();
      this.toast.show('Exportado como SVG', 'info');
    };
    img.src = url;
  }

  save() {
    this.saving = true;
    const nodes = this.graphNodes.map((n, i) => ({
      id: n.id,
      title: n.label,
      nodeType: n.data?.['nodeType'] || 'ACTION',
      departmentId: n.data?.['departmentId'],
      positionX: n.position?.x ?? n.data?.['positionX'] ?? i * 200,
      positionY: n.position?.y ?? n.data?.['positionY'] ?? 100,
      documentPermission: n.data?.['documentPermission'] || 'VIEW_EDIT',
      slaHours: n.data?.['slaHours'] ?? null,
      voiceEnabled: n.data?.['voiceEnabled'] ?? false,
    }));
    const edges = this.graphLinks.map(l => ({
      fromNodeId: l.source,
      toNodeId: l.target,
      flowType: l.data?.['flowType'] || 'SEQUENTIAL',
      conditionLabel: l.data?.['conditionLabel'] || undefined,
    }));
    this.http.put(`${API_BASE}/policies/${this.policyId}/graph`, { nodes, edges }).subscribe({
      next: () => { this.toast.show('Diagrama guardado', 'success'); this.saving = false; },
      error: () => { this.toast.show('Error al guardar', 'error'); this.saving = false; }
    });
  }

  // ──────────── Swim lane layout ────────────
  private computeLaneView(): any {
    if (!this.graphNodes.length) return null;
    const NODE_W = 140, NODE_H = 46, HDR_W = 145, STEP_X = 220;
    const outAdj = new Map<string, string[]>();
    const inAdj = new Map<string, string[]>();
    this.graphNodes.forEach(n => { outAdj.set(n.id, []); inAdj.set(n.id, []); });
    this.graphLinks.forEach(e => {
      outAdj.get(e.source)?.push(e.target);
      inAdj.get(e.target)?.push(e.source);
    });
    // Kahn's topological sort
    const inDeg = new Map<string, number>();
    this.graphNodes.forEach(n => inDeg.set(n.id, (inAdj.get(n.id) || []).length));
    const topo: string[] = [];
    let queue = this.graphNodes.filter(n => inDeg.get(n.id) === 0).map(n => n.id);
    if (!queue.length) queue = [this.graphNodes[0].id];
    while (queue.length) {
      const next: string[] = [];
      queue.forEach(id => {
        topo.push(id);
        (outAdj.get(id) || []).forEach(t => {
          const d = (inDeg.get(t) ?? 1) - 1; inDeg.set(t, d);
          if (d === 0) next.push(t);
        });
      });
      queue = next;
    }
    this.graphNodes.forEach(n => { if (!topo.includes(n.id)) topo.push(n.id); });
    // Longest-path column assignment
    const colMap = new Map<string, number>();
    topo.forEach(id => {
      const preds = inAdj.get(id) || [];
      colMap.set(id, preds.length ? Math.max(...preds.map(p => (colMap.get(p) ?? 0) + 1)) : 0);
    });
    // Collect unique depts in topo order
    const depts: string[] = [];
    const deptSeen = new Set<string>();
    topo.forEach(id => {
      const nodeData = this.graphNodes.find(x => x.id === id)?.data as any;
      const d = nodeData?.deptName
        || this.departments.find(dep => dep.id === nodeData?.departmentId)?.name
        || 'General';
      if (!deptSeen.has(d)) { deptSeen.add(d); depts.push(d); }
    });
    const deptIdx = new Map(depts.map((d, i) => [d, i]));
    const halfW = (t: string) => t === 'INITIAL' || t === 'FINAL' ? 22 : t === 'DECISION' ? 54 : t === 'FORK' || t === 'JOIN' ? 52 : 70;
    // Count nodes per (col, row) slot to compute dynamic lane height
    const slotMax = new Map<string, number>();
    const resolveDept = (nodeData: any): string =>
      nodeData?.deptName
      || this.departments.find(d => d.id === nodeData?.departmentId)?.name
      || 'General';
    topo.forEach(id => {
      const n = this.graphNodes.find(x => x.id === id)!;
      const col = colMap.get(id) ?? 0;
      const row = deptIdx.get(resolveDept(n.data)) ?? 0;
      const key = `${col}-${row}`;
      slotMax.set(key, (slotMax.get(key) ?? 0) + 1);
    });
    const maxNodesPerSlot = Math.max(...Array.from(slotMax.values()), 1);
    const LANE_H = Math.max(130, 70 + maxNodesPerSlot * 65);
    // Place nodes, centered within each slot
    const slotCounter = new Map<string, number>();
    const posNodes = topo.map(id => {
      const n = this.graphNodes.find(x => x.id === id)!;
      const col = colMap.get(id) ?? 0;
      const deptName = resolveDept(n.data);
      const row = deptIdx.get(deptName) ?? 0;
      const slotKey = `${col}-${row}`;
      const slot = slotCounter.get(slotKey) ?? 0;
      slotCounter.set(slotKey, slot + 1);
      const total = slotMax.get(slotKey) ?? 1;
      const cx = HDR_W + col * STEP_X + STEP_X / 2;
      const slotOffset = total > 1 ? (slot - (total - 1) / 2) * 65 : 0;
      const cy = row * LANE_H + LANE_H / 2 + slotOffset;
      const nodeType = (n.data as any)?.nodeType as string;
      return { id, label: n.label as string, nodeType, cx, cy, x: cx - NODE_W / 2, y: cy - NODE_H / 2, hw: halfW(nodeType) };
    });
    const posMap = new Map(posNodes.map(n => [n.id, n]));
    const maxCol = Math.max(...Array.from(colMap.values()), 0);
    const svgW = HDR_W + (maxCol + 1) * STEP_X + 20;
    const svgH = depts.length * LANE_H;
    const edges = this.graphLinks.map(e => {
      const s = posMap.get(e.source); const t = posMap.get(e.target);
      if (!s || !t) return null;
      const x1 = s.cx + s.hw, y1 = s.cy, x2 = t.cx - t.hw, y2 = t.cy;
      const dx = Math.max(40, Math.abs(x2 - x1) * 0.4);
      const d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
      return { id: e.id, d, label: (e.label as string) || '', midX: (x1 + x2) / 2, midY: (y1 + y2) / 2 };
    }).filter(Boolean) as { id: string; d: string; label: string; midX: number; midY: number }[];
    return { depts, nodes: posNodes, edges, svgW, svgH, LANE_H, HDR_W, NODE_W, NODE_H };
  }

  // ──────────── Voice helpers ────────────
  private getSpeechRecognition(): any {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { this.voiceError = 'Voz no soportada en este navegador. Usa Chrome.'; return null; }
    this.voiceError = '';
    const r = new SpeechRecognition();
    r.lang = 'es-ES';
    r.interimResults = false;
    r.maxAlternatives = 1;
    return r;
  }

  startVoiceAi() {
    if (this.listeningAi) { this.recognition?.stop(); return; }
    const r = this.getSpeechRecognition();
    if (!r) return;
    this.recognition = r;
    this.listeningAi = true;
    r.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.zone.run(() => { this.aiPrompt = (this.aiPrompt + ' ' + transcript).trim(); this.listeningAi = false; });
    };
    r.onerror = (e: any) => this.zone.run(() => { this.voiceError = 'Error de voz: ' + e.error; this.listeningAi = false; });
    r.onend = () => this.zone.run(() => this.listeningAi = false);
    r.start();
  }

  voiceNodeTitle() {
    if (this.listeningNodeTitle) { this.recognition?.stop(); return; }
    const r = this.getSpeechRecognition();
    if (!r) return;
    this.recognition = r;
    this.listeningNodeTitle = true;
    r.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.zone.run(() => { this.newNodeTitle = transcript; this.listeningNodeTitle = false; });
    };
    r.onerror = (e: any) => this.zone.run(() => { this.voiceError = 'Error: ' + e.error; this.listeningNodeTitle = false; });
    r.onend = () => this.zone.run(() => this.listeningNodeTitle = false);
    r.start();
  }
  // ─────────────────────────────────────────

  async uploadImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.ocrLoading = true;
    this.ocrProgress = 0;
    this.voiceError = '';
    this.aiMessages = [...this.aiMessages, { role: 'user', text: `[Imagen] ${file.name}` }];
    try {
      const worker = await createWorker('spa', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            this.zone.run(() => this.ocrProgress = Math.round(m.progress * 100));
          }
        }
      });
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      const extracted = text.trim();
      if (!extracted) {
        this.aiMessages = [...this.aiMessages, { role: 'ai', text: 'No se pudo extraer texto de la imagen. Intenta con una imagen más nítida.' }];
        this.ocrLoading = false;
        return;
      }
      this.aiMessages = [...this.aiMessages, { role: 'ai', text: `Texto extraído: "${extracted.slice(0, 120)}${extracted.length > 120 ? '...' : ''}"` }];
      // Send extracted text to AI backend
      this.http.post<AiResponse>(`${API_BASE}/ai-assistant/image`, { extractedText: extracted }).subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.ocrLoading = false;
            this.aiMessages = [...this.aiMessages, { role: 'ai', text: res.suggestion }];
            this._applyAiResult(res);
          });
        },
        error: () => this.zone.run(() => {
          this.ocrLoading = false;
          this.aiMessages = [...this.aiMessages, { role: 'ai', text: 'Error al procesar la imagen con IA.' }];
        })
      });
    } catch (err: any) {
      this.zone.run(() => {
        this.ocrLoading = false;
        this.voiceError = 'Error OCR: ' + (err?.message || 'desconocido');
      });
    }
  }

  sendAiPrompt() {
    if (!this.aiPrompt.trim()) return;
    const userMsg = this.aiPrompt;
    this.aiMessages = [...this.aiMessages, { role: 'user', text: userMsg }];
    this.aiPrompt = '';
    this.aiLoading = true;
    this.http.post<AiResponse>(`${API_BASE}/ai-assistant/prompt`, { prompt: userMsg }).subscribe({
      next: (res) => {
        this.aiLoading = false;
        this.aiMessages = [...this.aiMessages, { role: 'ai', text: res.suggestion }];
        this._applyAiResult(res);
      },
      error: () => {
        this.aiLoading = false;
        this.aiMessages = [...this.aiMessages, { role: 'ai', text: 'Error al procesar el prompt.' }];
      }
    });
  }

  /** Applies nodes and connections returned by any AI endpoint to the local diagram. */
  private _applyAiResult(res: AiResponse) {
    let addedNodes = 0;
    let addedEdges = 0;
    if (res.nodes?.length) {
      res.nodes.forEach((n, i) => {
        // Skip if a node with this label already exists
        if (this.graphNodes.some(g => (g.label as string)?.toLowerCase() === n.title?.toLowerCase())) return;
        const dept = this.departments.find(d => d.name.toLowerCase().includes(n.department?.toLowerCase() || ''));
        const nd: Node = {
          id: uuid(),
          label: n.title,
          data: { nodeType: 'ACTION', deptName: dept?.name || '', departmentId: dept?.id || '', positionX: 200 + i * 200, positionY: 100 },
          dimension: { width: 140, height: 50 },
        };
        this.graphNodes = [...this.graphNodes, nd];
        addedNodes++;
      });
    }
    if (res.connections?.length) {
      res.connections.forEach(c => {
        const src = this.graphNodes.find(g => (g.label as string)?.toLowerCase().includes(c.from?.toLowerCase() || ''));
        const tgt = this.graphNodes.find(g => (g.label as string)?.toLowerCase().includes(c.to?.toLowerCase() || ''));
        if (!src || !tgt) return;
        // Skip duplicate edges
        if (this.graphLinks.some(l => l.source === src.id && l.target === tgt.id)) return;
        const flowType = c.flowType || 'SEQUENTIAL';
        const edge: Edge = {
          id: uuid(),
          source: src.id,
          target: tgt.id,
          label: flowType !== 'SEQUENTIAL' ? flowType : undefined,
          data: { flowType, conditionLabel: flowType !== 'SEQUENTIAL' ? flowType : '' },
        };
        this.graphLinks = [...this.graphLinks, edge];
        addedEdges++;
      });
    }
    if (addedNodes || addedEdges) {
      this.laneViewData = this.computeLaneView();
      setTimeout(() => this.graphUpdate$.next(true), 50);
      const parts: string[] = [];
      if (addedNodes) parts.push(`${addedNodes} nodo(s)`);
      if (addedEdges) parts.push(`${addedEdges} conexión(es)`);
      this.toast.show(`IA agregó: ${parts.join(' y ')}`, 'success');
    }
  }

  // ──────────── REQ-10: Collaborative real-time editing ──────────────────────
  private connectEditorWs() {
    this.stompClient = new Client({
      brokerURL: `${WS_BASE}/ws/websocket`,
      reconnectDelay: 5000,
      onConnect: () => {
        this.zone.run(() => this.wsConnected = true);

        // Suscribirse a eventos de política (cambios en el diagrama)
        this.stompClient!.subscribe('/topic/events', (msg) => {
          const payload = JSON.parse(msg.body);
          if (payload.type === 'policy:updated' && payload.data?.policyId === this.policyId) {
            this.zone.run(() => {
              this.toast.show('Diagrama actualizado por un colaborador', 'info');
              this.http.get<any>(`${API_BASE}/policies/${this.policyId}`).subscribe(p => {
                this.graphNodes = (p.nodes || []).map((n: any, i: number) => this._mapNode(n, i));
                this.graphLinks = (p.edges || []).map((e: any) => ({
                  id: e.id || uuid(), source: e.fromNodeId, target: e.toNodeId,
                  label: e.conditionLabel || (e.flowType !== 'SEQUENTIAL' ? e.flowType : ''),
                  data: { flowType: e.flowType, conditionLabel: e.conditionLabel },
                }));
                this.laneViewData = this.computeLaneView();
                setTimeout(() => this.graphUpdate$.next(true), 50);
              });
            });
          }
        });

        // Suscribirse a presencia de otros editores del diagrama
        const sessionId = `policy-${this.policyId}`;
        this.stompClient!.subscribe(`/topic/document/${sessionId}/session`, (msg) => {
          const update = JSON.parse(msg.body);
          this.zone.run(() => {
            this.editorUsers = (update.users || []).filter((u: EditorUser) => u.userId !== this.myEditorUserId);
          });
        });

        // Anunciar presencia propia
        const userName = this._getMyName();
        this.stompClient!.publish({
          destination: `/app/document/${sessionId}/join`,
          body: JSON.stringify({ userId: this.myEditorUserId, userName, color: this.myEditorColor }),
        });
      },
      onDisconnect: () => this.zone.run(() => this.wsConnected = false),
    });
    this.stompClient.activate();
  }

  private _getMyName(): string {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.name || payload.sub || 'Editor';
      }
    } catch { }
    return 'Editor';
  }

  ngOnDestroy() {
    // Abandonar sesión de presencia al salir
    if (this.stompClient?.connected && this.policyId) {
      const sessionId = `policy-${this.policyId}`;
      this.stompClient.publish({
        destination: `/app/document/${sessionId}/leave`,
        body: JSON.stringify({ userId: this.myEditorUserId }),
      });
    }
    this.stompClient?.deactivate();
    this.currentAudio?.pause();
    window.speechSynthesis?.cancel();
  }

  // ──────────── REQ-13: ElevenLabs TTS ────────────────────────────────────────
  speakMessage(text: string, idx: number) {
    if (this.speakingIdx === idx) {
      this.currentAudio?.pause();
      window.speechSynthesis?.cancel();
      this.speakingIdx = null;
      return;
    }
    this.speakingIdx = idx;
    this.http.post(`${API_BASE}/ai-assistant/tts`, { text }, { responseType: 'blob' }).subscribe({
      next: (blob: any) => {
        if (!blob || blob.size === 0) { this.browserSpeak(text, idx); return; }
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        this.currentAudio = audio;
        audio.play();
        audio.onended = () => this.zone.run(() => { this.speakingIdx = null; URL.revokeObjectURL(url); });
        audio.onerror = () => this.zone.run(() => { this.speakingIdx = null; this.browserSpeak(text, idx); });
      },
      error: () => this.browserSpeak(text, idx),
    });
  }

  private browserSpeak(text: string, idx: number) {
    if (!window.speechSynthesis) { this.speakingIdx = null; return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'es-ES';
    utt.rate = 0.95;
    utt.onend = () => this.zone.run(() => this.speakingIdx = null);
    this.speakingIdx = idx;
    window.speechSynthesis.speak(utt);
  }
}
