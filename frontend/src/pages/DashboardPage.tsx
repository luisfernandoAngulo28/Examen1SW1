import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

interface Policy {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    api.get('/policies').then((res) => setPolicies(res.data));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: 16 }}>
            {user?.name} ({user?.role})
          </span>
          <button onClick={logout} style={{ padding: '6px 12px', cursor: 'pointer' }}>Cerrar sesión</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {user?.role === 'DESIGNER' && (
          <>
            <Link to="/policies/new" style={{ padding: '10px 20px', background: '#1677ff', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>
              Nueva Política
            </Link>
            <Link to="/departments" style={{ padding: '10px 20px', background: '#52c41a', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>
              Departamentos
            </Link>
            <Link to="/monitor" style={{ padding: '10px 20px', background: '#722ed1', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>
              Monitor en Vivo
            </Link>
            <Link to="/analytics" style={{ padding: '10px 20px', background: '#fa8c16', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>
              Analytics
            </Link>
          </>
        )}
      </div>

      <h2>Políticas de Negocio</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Nombre</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Estado</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{p.name}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                <span style={{ color: p.status === 'ACTIVE' ? '#52c41a' : '#999' }}>{p.status}</span>
              </td>
              <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                <Link to={`/policies/${p.id}/editor`} style={{ marginRight: 8, color: '#1677ff' }}>Editar diagrama</Link>
                <Link to={`/policies/${p.id}/cases`} style={{ color: '#fa8c16' }}>Ver trámites</Link>
              </td>
            </tr>
          ))}
          {policies.length === 0 && (
            <tr><td colSpan={3} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No hay políticas creadas</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
