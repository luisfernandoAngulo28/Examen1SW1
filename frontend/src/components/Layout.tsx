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
            style={{
              marginTop: 14, width: '100%', padding: '9px 12px',
              background: 'rgba(255,255,255,.04)', color: '#8896ab',
              border: '1px solid rgba(255,255,255,.08)', borderRadius: 10,
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#8896ab'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; }}
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
