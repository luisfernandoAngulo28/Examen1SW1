import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const designerNav = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/monitor', label: 'Monitor en Vivo', icon: '📡' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/departments', label: 'Departamentos', icon: '🏢' },
];

const officerNav = [
  { to: '/', label: 'Mi Bandeja', icon: '📋' },
  { to: '/monitor', label: 'Monitor en Vivo', icon: '📡' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>⚡</span> Workflow<span>SW1</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Principal</div>
          {(user?.role === 'OFFICER' ? officerNav : designerNav).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'DESIGNER' && (
            <>
              <div className="sidebar-section">Gestión</div>
              <NavLink to="/policies/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span>➕</span> Nueva Política
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span>👤</span> Registrar Usuario
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ marginTop: 12, width: '100%', padding: '8px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
