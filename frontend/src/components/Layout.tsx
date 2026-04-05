import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Radio, BarChart3, Building2, ClipboardList, Plus, UserPlus, LogOut, Zap } from 'lucide-react';

const designerNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/monitor', label: 'Monitor en Vivo', icon: Radio },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/departments', label: 'Departamentos', icon: Building2 },
];

const officerNav = [
  { to: '/', label: 'Mi Bandeja', icon: ClipboardList },
  { to: '/monitor', label: 'Monitor en Vivo', icon: Radio },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
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
          <Zap size={20} color="#a78bfa" /> Workflow<span>SW1</span>
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
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'DESIGNER' && (
            <>
              <div className="sidebar-section">Gestión</div>
              <NavLink to="/policies/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Plus size={18} /> Nueva Política
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <UserPlus size={18} /> Registrar Usuario
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
            style={{ marginTop: 12, width: '100%', padding: '8px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
