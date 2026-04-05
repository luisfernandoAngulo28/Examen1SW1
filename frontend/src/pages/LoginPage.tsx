import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Credenciales invalidas');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card fade-in">
        <div className="login-brand">
          <h1>⚡ Workflow<span>SW1</span></h1>
          <p>Sistema de Gestión de Políticas de Negocio</p>
        </div>
        {error && <p style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{error}</p>}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="admin@test.com" />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="form-label">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" placeholder="••••••" />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
          Iniciar sesión
        </button>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/register" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </form>
    </div>
  );
}
