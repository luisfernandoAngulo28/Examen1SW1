import { useState, FormEvent, useRef } from 'react';
import { Mic, Square, Save } from 'lucide-react';

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
  onSubmit?: (data: Record<string, any>, inputMode: string) => void;
  submitting?: boolean;
}

export default function DynamicForm({ schema, initialData, readOnly, onSubmit, submitting }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  const [listeningField, setListeningField] = useState<string | null>(null);
  const [usedVoice, setUsedVoice] = useState(false);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData, usedVoice ? 'VOICE' : 'MANUAL');
  };

  const startVoiceForField = (fieldName: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Tu navegador no soporta reconocimiento de voz'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    setListeningField(fieldName);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setListeningField(null);
      setUsedVoice(true);
      handleChange(fieldName, transcript);
    };
    recognition.onerror = () => setListeningField(null);
    recognition.onend = () => setListeningField(null);
    recognition.start();
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
              <div style={{ position: 'relative' }}>
                <textarea
                  className="form-input"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={readOnly}
                  placeholder={field.placeholder}
                  rows={3}
                  style={{ resize: 'vertical', paddingRight: readOnly ? undefined : 40 }}
                />
                {!readOnly && (
                  <button type="button" onClick={() => startVoiceForField(field.name)}
                    className={`voice-btn ${listeningField === field.name ? 'listening' : ''}`}
                    title="Dictar por voz"
                  >
                    {listeningField === field.name ? <Square size={14} /> : <Mic size={14} />}
                  </button>
                )}
              </div>
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
              <div style={{ position: 'relative' }}>
                <input
                  type={field.type}
                  className="form-input"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  required={field.required}
                  disabled={readOnly}
                  placeholder={field.placeholder}
                  style={!readOnly && (field.type === 'text' || field.type === 'email') ? { paddingRight: 40 } : undefined}
                />
                {!readOnly && (field.type === 'text' || field.type === 'email') && (
                  <button type="button" onClick={() => startVoiceForField(field.name)}
                    className={`voice-btn ${listeningField === field.name ? 'listening' : ''}`}
                    title="Dictar por voz"
                  >
                    {listeningField === field.name ? <Square size={14} /> : <Mic size={14} />}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!readOnly && onSubmit && (
        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 12 }} disabled={submitting}>
          {submitting ? 'Guardando...' : <><Save size={14} /> Guardar formulario</>}
        </button>
      )}
    </form>
  );
}
