interface Props {
  status: string;
  size?: number;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; glow: string; label: string }> = {
  DONE: { color: '#10b981', glow: 'rgba(16,185,129,.4)', label: 'Completado' },
  COMPLETED: { color: '#10b981', glow: 'rgba(16,185,129,.4)', label: 'Completado' },
  IN_PROGRESS: { color: '#f59e0b', glow: 'rgba(245,158,11,.4)', label: 'En progreso' },
  PENDING: { color: '#ef4444', glow: 'rgba(239,68,68,.4)', label: 'Pendiente' },
  OPEN: { color: '#f59e0b', glow: 'rgba(245,158,11,.4)', label: 'Abierto' },
  BLOCKED: { color: '#ef4444', glow: 'rgba(239,68,68,.4)', label: 'Bloqueado' },
  CANCELLED: { color: '#64748b', glow: 'rgba(100,116,139,.4)', label: 'Cancelado' },
};

export default function TrafficLight({ status, size = 14, showLabel = false }: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <span className="traffic-light" title={config.label}>
      <span
        className="traffic-dot"
        style={{
          width: size,
          height: size,
          background: config.color,
          boxShadow: `0 0 ${size * 0.6}px ${config.glow}`,
        }}
      />
      {showLabel && <span className="traffic-label">{config.label}</span>}
    </span>
  );
}
