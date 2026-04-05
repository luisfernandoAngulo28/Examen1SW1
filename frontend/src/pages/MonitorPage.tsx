import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import TrafficLight from '../components/TrafficLight';

interface Task {
  id: string;
  status: string;
  startedAt: string;
  node: { id: string; title: string; department?: { name: string } };
  assignedUser: { id: string; name: string; email: string } | null;
}

interface CaseInfo {
  id: string;
  status: string;
  startedAt: string;
  policy: { id: string; name: string };
  tasks: Task[];
}

export default function MonitorPage() {
  const { user } = useAuth();
  const [activeCases, setActiveCases] = useState<CaseInfo[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [eventFeed, setEventFeed] = useState<{ type: string; time: string; detail: string }[]>([]);

  // Load active cases
  const loadCases = () => {
    api.get('/cases').then((res) => {
      setActiveCases(res.data.filter((c: CaseInfo) => c.status === 'IN_PROGRESS'));
    });
  };

  useEffect(() => {
    loadCases();

    const socket: Socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      query: { userId: user?.id },
    });

    socket.on('users:online', (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.on('case:started', (data: CaseInfo) => {
      setEventFeed((prev) => [{ type: 'CASE_STARTED', time: new Date().toLocaleTimeString(), detail: data.policy.name }, ...prev].slice(0, 50));
      loadCases();
    });

    socket.on('task:completed', (data: CaseInfo) => {
      setEventFeed((prev) => [{ type: 'TASK_COMPLETED', time: new Date().toLocaleTimeString(), detail: data.policy.name }, ...prev].slice(0, 50));
      loadCases();
    });

    socket.on('task:assigned', (data: any) => {
      setEventFeed((prev) => [{ type: 'TASK_ASSIGNED', time: new Date().toLocaleTimeString(), detail: `${data?.node?.title || ''} → ${data?.assignedUser?.name || ''}` }, ...prev].slice(0, 50));
      loadCases();
    });

    socket.on('case:completed', (data: CaseInfo) => {
      setEventFeed((prev) => [{ type: 'CASE_COMPLETED', time: new Date().toLocaleTimeString(), detail: data.policy.name }, ...prev].slice(0, 50));
      loadCases();
    });

    return () => { socket.disconnect(); };
  }, []);

  const statusColor: Record<string, string> = {
    PENDING: '#999',
    IN_PROGRESS: '#fa8c16',
    DONE: '#52c41a',
    BLOCKED: '#ff4d4f',
  };

  const eventColor: Record<string, string> = {
    CASE_STARTED: '#1677ff',
    TASK_COMPLETED: '#52c41a',
    TASK_ASSIGNED: '#fa8c16',
    CASE_COMPLETED: '#52c41a',
  };

  return (
    <>
      <div className="page-header">
        <h1>📡 Monitor en Tiempo Real</h1>
        <div className="badge badge-green" style={{ fontSize: 14, padding: '6px 14px' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', marginRight: 8 }} />
          {onlineUsers.length} conectado(s)
        </div>
      </div>
      <div className="page-body fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        {/* Left: Active cases & tasks */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Trámites Activos ({activeCases.length})</h2>
          {activeCases.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay trámites activos.</p>}
          {activeCases.map((c) => (
            <div key={c.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrafficLight status={c.status} size={16} />
                  <strong style={{ fontSize: 16 }}>{c.policy.name}</strong>
                  <span className="badge badge-orange" style={{ fontSize: 11 }}>{c.status}</span>
                </div>
                <Link to={`/cases/${c.id}`} className="btn btn-ghost btn-sm">Ver detalle</Link>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {c.tasks.map((t) => (
                  <div key={t.id} style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: `1px solid ${statusColor[t.status]}`,
                    background: t.status === 'DONE' ? '#f6ffed' : t.status === 'IN_PROGRESS' ? '#fff7e6' : '#fafafa',
                    fontSize: 13,
                  }}>
                    <TrafficLight status={t.status} size={10} />
                    <strong>{t.node.title}</strong>
                    <span style={{ color: '#888', marginLeft: 6 }}>[{t.node.department?.name}]</span>
                    <span style={{ color: statusColor[t.status], marginLeft: 4, fontWeight: 600 }}>{t.status}</span>
                    {t.assignedUser && <span style={{ marginLeft: 6, color: '#666' }}>→ {t.assignedUser.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Live event feed */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Eventos en Vivo</h2>
          <div className="event-feed">
            {eventFeed.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: 16 }}>Esperando eventos...</p>}
            {eventFeed.map((ev, i) => (
              <div key={i} className="event-item">
                <span className="event-time">{ev.time}</span>
                <span className="event-type" style={{ color: eventColor[ev.type] || '#fff' }}>{ev.type}</span>
                <span className="event-detail">{ev.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
