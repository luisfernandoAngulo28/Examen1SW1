import { useState, FormEvent } from 'react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'date' | 'email' | 'checkbox';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormSchema {
  fields: FormField[];
}

interface Props {
  schema: FormSchema;
  initialData?: Record<string, any> | null;
  readOnly?: boolean;
  onSubmit?: (data: Record<string, any>) => void;
  submitting?: boolean;
}

export default function DynamicForm({ schema, initialData, readOnly, onSubmit, submitting }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  if (!schema?.fields?.length) return null;

  return (
    <form onSubmit={handleSubmit} className="dynamic-form">
      <div className="dynamic-form-grid">
        {schema.fields.map((field) => (
          <div key={field.name} className={`dynamic-form-field ${field.type === 'textarea' ? 'full-width' : ''}`}>
            <label className="form-label">
              {field.label}
              {field.required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                className="form-input"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                disabled={readOnly}
                placeholder={field.placeholder}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            ) : field.type === 'select' ? (
              <select
                className="form-input"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                disabled={readOnly}
              >
                <option value="">Seleccionar...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: readOnly ? 'default' : 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  disabled={readOnly}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{field.placeholder || 'Sí'}</span>
              </label>
            ) : (
              <input
                type={field.type}
                className="form-input"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                required={field.required}
                disabled={readOnly}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      {!readOnly && onSubmit && (
        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 12 }} disabled={submitting}>
          {submitting ? 'Guardando...' : '💾 Guardar formulario'}
        </button>
      )}
    </form>
  );
}
