import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../api';

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

    const socket: Socket = io('http://localhost:3000', {
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
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Link to="/" style={{ color: '#1677ff', textDecoration: 'none' }}>&larr; Dashboard</Link>
          <h1 style={{ margin: '8px 0' }}>Monitor en Tiempo Real</h1>
        </div>
        <div style={{ background: '#f0f5ff', padding: '8px 16px', borderRadius: 8 }}>
          <strong>{onlineUsers.length}</strong> usuario(s) conectado(s)
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#52c41a', borderRadius: '50%', marginLeft: 8 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        {/* Left: Active cases & tasks */}
        <div>
          <h2>Trámites Activos ({activeCases.length})</h2>
          {activeCases.length === 0 && <p style={{ color: '#999' }}>No hay trámites activos.</p>}
          {activeCases.map((c) => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 16 }}>{c.policy.name}</strong>
                  <span style={{ marginLeft: 12, color: '#fa8c16', fontWeight: 600 }}>{c.status}</span>
                </div>
                <Link to={`/cases/${c.id}`} style={{ color: '#1677ff', fontSize: 13 }}>Ver detalle</Link>
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
                    <strong>{t.node.title}</strong>
                    <span style={{ color: '#888', marginLeft: 6 }}>[{t.node.department?.name}]</span>
                    <span style={{ color: statusColor[t.status], marginLeft: 8, fontWeight: 600 }}>{t.status}</span>
                    {t.assignedUser && <span style={{ marginLeft: 6, color: '#666' }}>→ {t.assignedUser.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Live event feed */}
        <div>
          <h2>Eventos en Vivo</h2>
          <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 16, maxHeight: 500, overflowY: 'auto' }}>
            {eventFeed.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>Esperando eventos...</p>}
            {eventFeed.map((ev, i) => (
              <div key={i} style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: '#16213e' }}>
                <span style={{ color: '#888', fontSize: 12 }}>{ev.time}</span>
                <span style={{ color: eventColor[ev.type] || '#fff', marginLeft: 8, fontWeight: 600, fontSize: 13 }}>{ev.type}</span>
                <span style={{ color: '#ccc', marginLeft: 8, fontSize: 13 }}>{ev.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
