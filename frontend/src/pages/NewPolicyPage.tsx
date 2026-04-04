import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NewPolicyPage() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await api.post('/policies', { name });
    navigate(`/policies/${res.data.id}/editor`);
  };

  return (
    <>
      <div className="page-header">
        <h1>📝 Nueva Política de Negocio</h1>
      </div>
      <div className="page-body fade-in">
        <div className="card" style={{ maxWidth: 480, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Nombre de la política</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej: Instalación de medidor CRE"
                className="form-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Crear y abrir editor
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
