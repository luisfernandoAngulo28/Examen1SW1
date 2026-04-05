import { Handle, Position } from '@xyflow/react';

/* ── Initial Node  ●  ─────────────────────────────────── */
export function InitialNode({ data }: any) {
  const label = data?.label || data?.title || '';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 10, minWidth: 60, minHeight: 60,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', background: '#000',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }} />
      {label && (
        <span style={{ fontSize: 11, marginTop: 6, color: '#333', fontWeight: 600, textAlign: 'center', maxWidth: 120, wordBreak: 'break-word' }}>
          {String(label).split('\n')[0]}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: '#000', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Top} style={{ background: '#000', width: 8, height: 8 }} />
    </div>
  );
}

/* ── Final Node  ◉  ────────────────────────────────────── */
export function FinalNode({ data }: any) {
  const label = data?.label || data?.title || '';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 10, minWidth: 60, minHeight: 60,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: '#fff', border: '4px solid #000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#000' }} />
      </div>
      {label && (
        <span style={{ fontSize: 11, marginTop: 6, color: '#333', fontWeight: 600, textAlign: 'center', maxWidth: 120, wordBreak: 'break-word' }}>
          {String(label).split('\n')[0]}
        </span>
      )}
      <Handle type="target" position={Position.Top} style={{ background: '#000', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#000', width: 8, height: 8 }} />
    </div>
  );
}

/* ── Decision Node  ◇  ─────────────────────────────────── */
export function DecisionNode({ data }: any) {
  const label = data?.label || data?.title || '?';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 20, minWidth: 100, minHeight: 100,
    }}>
      <div style={{
        width: 70, height: 70,
        background: '#FFF9C4', border: '3px solid #F9A825',
        transform: 'rotate(45deg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(249,168,37,0.4)',
      }}>
        <span style={{
          transform: 'rotate(-45deg)',
          fontSize: 11, fontWeight: 'bold', textAlign: 'center',
          maxWidth: 55, overflow: 'hidden', lineHeight: 1.2,
          color: '#333',
        }}>
          {String(label).split('\n')[0]}
        </span>
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#F9A825', width: 8, height: 8, top: 5 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#F9A825', width: 8, height: 8, bottom: 5 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#F9A825', width: 8, height: 8, right: 5 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ background: '#F9A825', width: 8, height: 8, left: 5 }} />
    </div>
  );
}

/* ── Fork / Join Node  ═  ──────────────────────────────── */
export function ForkJoinNode({ data }: any) {
  const label = data?.label || data?.title || '';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 10, minWidth: 140, minHeight: 30,
    }}>
      <div style={{
        width: 140, height: 10, background: '#000', borderRadius: 4,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }} />
      {label && (
        <span style={{ fontSize: 11, marginTop: 6, color: '#333', fontWeight: 600, textAlign: 'center', maxWidth: 140, wordBreak: 'break-word' }}>
          {String(label).split('\n')[0]}
        </span>
      )}
      <Handle type="target" position={Position.Top} style={{ background: '#000', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#000', width: 8, height: 8 }} />
    </div>
  );
}
