import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { useToast } from '../components/Toast';

interface Department {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OFFICER' as 'DESIGNER' | 'OFFICER', departmentId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/departments').then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (!form.email.includes('@')) { setError('Ingresa un email válido'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        departmentId: form.departmentId || undefined,
      });
      toast('Usuario creado exitosamente', 'success');
      if (user) {
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>⚡ Workflow <span style={{ color: 'var(--accent)' }}>SW1</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>Crear nuevo usuario</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Nombre completo</label>
            <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Juan Pérez" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Correo electrónico</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="correo@empresa.com" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Mínimo 6 caracteres" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Rol</label>
            <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'DESIGNER' | 'OFFICER' })}>
              <option value="OFFICER">Funcionario (OFFICER)</option>
              <option value="DESIGNER">Diseñador (DESIGNER)</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Departamento (opcional)</label>
            <select className="form-input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              <option value="">Sin departamento</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15 }} disabled={loading}>
            {loading ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
