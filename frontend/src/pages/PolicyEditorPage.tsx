import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import api from '../api';

interface Department {
  id: string;
  name: string;
}

export default function PolicyEditorPage() {
  const { id: policyId } = useParams<{ id: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [policyName, setPolicyName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [formFields, setFormFields] = useState<{ name: string; label: string; type: string; required: boolean; options?: string[] }[]>([]);
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [savingForm, setSavingForm] = useState(false);
  const [showLanes, setShowLanes] = useState(true);

  // Swimlane positions
  const LANE_WIDTH = 300;
  const getLaneX = (deptIndex: number) => deptIndex * LANE_WIDTH;
  const getNodeXForDept = (deptId: string) => {
    const idx = departments.findIndex((d) => d.id === deptId);
    return idx >= 0 ? getLaneX(idx) + LANE_WIDTH / 2 - 75 : Math.random() * 400;
  };

  useEffect(() => {
    api.get('/departments').then((res) => {
      setDepartments(res.data);
      if (res.data.length > 0) setSelectedDept(res.data[0].id);
    });

    if (policyId) {
      api.get(`/policies/${policyId}`).then((res) => {
        setPolicyName(res.data.name);
        const loadedNodes: Node[] = (res.data.nodes || []).map((n: any) => ({
          id: n.id,
          position: { x: n.positionX, y: n.positionY },
          data: { label: `${n.title}\n(${n.department?.name || 'Sin depto'})` },
          style: {
            background: '#fff',
            border: '2px solid #1677ff',
            borderRadius: 8,
            padding: 12,
            minWidth: 150,
          },
        }));
        const loadedEdges: Edge[] = (res.data.edges || []).map((e: any) => ({
          id: e.id,
          source: e.fromNodeId,
          target: e.toNodeId,
          label: e.flowType,
          animated: e.flowType === 'PARALLEL',
          style: { stroke: getEdgeColor(e.flowType) },
        }));
        setNodes(loadedNodes);
        setEdges(loadedEdges);
      });
    }
  }, [policyId]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        label: 'SEQUENTIAL',
        style: { stroke: '#1677ff' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  const addNode = () => {
    if (!newNodeTitle.trim() || !selectedDept) return;
    const dept = departments.find((d) => d.id === selectedDept);
    // Count existing nodes in same department to stack vertically
    const sameDepNodes = nodes.filter((n) => (n.data as any).departmentId === selectedDept);
    const newNode: Node = {
      id: crypto.randomUUID(),
      position: { x: getNodeXForDept(selectedDept), y: 80 + sameDepNodes.length * 130 },
      data: { label: `${newNodeTitle}\n(${dept?.name || ''})`, departmentId: selectedDept, title: newNodeTitle },
      style: {
        background: '#fff',
        border: '2px solid #1677ff',
        borderRadius: 8,
        padding: 12,
        minWidth: 150,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNewNodeTitle('');
  };

  const saveGraph = async () => {
    setSaving(true);
    const graphNodes = nodes.map((n) => ({
      id: n.id,
      departmentId: (n.data as any).departmentId || departments[0]?.id,
      title: (n.data as any).title || String(n.data.label).split('\n')[0],
      positionX: n.position.x,
      positionY: n.position.y,
    }));
    const graphEdges = edges.map((e) => ({
      fromNodeId: e.source,
      toNodeId: e.target,
      flowType: (e.label as string) || 'SEQUENTIAL',
    }));
    await api.put(`/policies/${policyId}/graph`, { nodes: graphNodes, edges: graphEdges });
    setSaving(false);
    alert('Diagrama guardado');
  };

  const handleAiPrompt = async (text: string) => {
    if (!text.trim()) return;
    setAiMessages((prev) => [...prev, { role: 'user', text }]);
    setAiPrompt('');

    try {
      const res = await api.post('/ai-assistant/prompt', { prompt: text });
      const data = res.data;

      if (data.suggestion && data.action === 'add_node' && data.nodes?.length === 1 && !data.connections) {
        setAiMessages((prev) => [...prev, { role: 'ai', text: data.suggestion }]);
        return;
      }

      // Process AI actions
      if (data.nodes && data.nodes.length > 0) {
        const newNodes: Node[] = [];
        data.nodes.forEach((n: any, i: number) => {
          const dept = departments.find((d) => d.name.toLowerCase() === n.department.toLowerCase());
          const deptId = dept?.id || departments[0]?.id;
          const node: Node = {
            id: crypto.randomUUID(),
            position: { x: getNodeXForDept(deptId), y: 80 + i * 130 },
            data: { label: `${n.title}\n(${dept?.name || n.department})`, departmentId: deptId, title: n.title },
            style: { background: '#fff', border: '2px solid #1677ff', borderRadius: 8, padding: 12, minWidth: 150 },
          };
          newNodes.push(node);
        });
        setNodes((nds) => [...nds, ...newNodes]);

        // Process connections if any
        if (data.connections) {
          setTimeout(() => {
            setNodes((currentNodes) => {
              const newEdges: Edge[] = [];
              data.connections.forEach((c: any) => {
                const fromNode = currentNodes.find((n) => (n.data as any).title?.toLowerCase() === c.from.toLowerCase());
                const toNode = currentNodes.find((n) => (n.data as any).title?.toLowerCase() === c.to.toLowerCase());
                if (fromNode && toNode) {
                  newEdges.push({
                    id: crypto.randomUUID(),
                    source: fromNode.id,
                    target: toNode.id,
                    label: c.flowType,
                    style: { stroke: getEdgeColor(c.flowType) },
                  });
                }
              });
              if (newEdges.length > 0) {
                setEdges((eds) => [...eds, ...newEdges]);
              }
              return currentNodes;
            });
          }, 100);
        }

        const msg = data.action === 'suggest_flow'
          ? `Generé un flujo para "${data.suggestion}" con ${data.nodes.length} actividades y ${data.connections?.length || 0} conexiones.`
          : `Agregué ${data.nodes.length} actividad(es) al diagrama.`;
        setAiMessages((prev) => [...prev, { role: 'ai', text: msg }]);
      } else if (data.action === 'remove_node') {
        const title = data.nodes?.[0]?.title?.toLowerCase();
        setNodes((nds) => nds.filter((n) => !(n.data as any).title?.toLowerCase().includes(title)));
        setAiMessages((prev) => [...prev, { role: 'ai', text: `Eliminé la actividad "${data.nodes[0].title}".` }]);
      }
    } catch {
      setAiMessages((prev) => [...prev, { role: 'ai', text: 'Error al procesar el comando.' }]);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiMessages((prev) => [...prev, { role: 'ai', text: 'Tu navegador no soporta reconocimiento de voz.' }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleAiPrompt(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiMessages((prev) => [...prev, { role: 'user', text: `📷 Imagen: ${file.name}` }]);
    setAiMessages((prev) => [...prev, { role: 'ai', text: 'Analizando imagen...' }]);

    try {
      // Use Canvas to load image, then try to extract any text-like content
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);

      // Send image info to backend for analysis
      // Since we don't have server-side OCR, we ask user to describe what's in the image
      // as a fallback, or process known patterns from the filename
      let extractedText = '';

      // Try to use the file name as a hint
      const nameHint = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      if (nameHint.length > 3) {
        extractedText = `crear flujo para ${nameHint}`;
      }

      // Also provide a prompt input approach
      const userDescription = prompt('Describe brevemente lo que muestra la imagen (ej: "flujo de contratación con 3 pasos: solicitud, revisión, aprobación"):');
      if (userDescription) {
        extractedText = userDescription;
      }

      if (!extractedText) {
        setAiMessages((prev) => [...prev.slice(0, -1), { role: 'ai', text: 'No se pudo analizar la imagen. Describe lo que contiene para procesarla.' }]);
        return;
      }

      const res = await api.post('/ai-assistant/image', { extractedText, fileName: file.name });
      const data = res.data;

      if (data.nodes && data.nodes.length > 0) {
        const newNodes: Node[] = [];
        data.nodes.forEach((n: any, i: number) => {
          const dept = departments.find((d) => d.name.toLowerCase() === (n.department || '').toLowerCase());
          const deptId = dept?.id || departments[0]?.id;
          const node: Node = {
            id: crypto.randomUUID(),
            position: { x: getNodeXForDept(deptId), y: 80 + i * 130 },
            data: { label: `${n.title}\n(${dept?.name || n.department || departments[0]?.name || ''})`, departmentId: deptId, title: n.title },
            style: { background: '#fff', border: '2px solid #1677ff', borderRadius: 8, padding: 12, minWidth: 150 },
          };
          newNodes.push(node);
        });
        setNodes((nds) => [...nds, ...newNodes]);

        if (data.connections) {
          setTimeout(() => {
            setNodes((currentNodes) => {
              const newEdges: Edge[] = [];
              data.connections.forEach((c: any) => {
                const fromNode = currentNodes.find((n) => (n.data as any).title?.toLowerCase() === c.from.toLowerCase());
                const toNode = currentNodes.find((n) => (n.data as any).title?.toLowerCase() === c.to.toLowerCase());
                if (fromNode && toNode) {
                  newEdges.push({ id: crypto.randomUUID(), source: fromNode.id, target: toNode.id, label: c.flowType, style: { stroke: getEdgeColor(c.flowType) } });
                }
              });
              if (newEdges.length > 0) setEdges((eds) => [...eds, ...newEdges]);
              return currentNodes;
            });
          }, 100);
        }

        setAiMessages((prev) => [...prev.slice(0, -1), { role: 'ai', text: `📷 ${data.suggestion || `Generé ${data.nodes.length} actividades desde la imagen.`}` }]);
      } else {
        setAiMessages((prev) => [...prev.slice(0, -1), { role: 'ai', text: data.suggestion || 'No se pudieron extraer actividades de la imagen.' }]);
      }
    } catch {
      setAiMessages((prev) => [...prev.slice(0, -1), { role: 'ai', text: 'Error al procesar la imagen.' }]);
    }

    // Reset input
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setShowFormPanel(true);
    // Load existing form template
    api.get(`/forms/template/${node.id}`).then((res) => {
      if (res.data?.schemaJson?.fields) {
        setFormFields(res.data.schemaJson.fields);
      } else {
        setFormFields([]);
      }
    }).catch(() => setFormFields([]));
  }, []);

  const addFormField = () => {
    setFormFields((prev) => [...prev, { name: `campo_${prev.length + 1}`, label: '', type: 'text', required: false }]);
  };

  const updateFormField = (index: number, key: string, value: any) => {
    setFormFields((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const removeFormField = (index: number) => {
    setFormFields((prev) => prev.filter((_, i) => i !== index));
  };

  const saveFormTemplate = async () => {
    if (!selectedNode) return;
    setSavingForm(true);
    try {
      await api.put(`/forms/template/${selectedNode.id}`, {
        schemaJson: { fields: formFields },
      });
      alert('Formulario guardado');
    } catch {
      alert('Error al guardar formulario');
    }
    setSavingForm(false);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 24px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ color: '#1677ff' }}>← Dashboard</Link>
        <h2 style={{ margin: 0 }}>{policyName}</h2>
        <div style={{ flex: 1 }} />

        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ padding: 6, borderRadius: 4 }}>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input
          value={newNodeTitle}
          onChange={(e) => setNewNodeTitle(e.target.value)}
          placeholder="Nombre actividad"
          style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button onClick={addNode} style={{ padding: '6px 12px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          + Actividad
        </button>
        <button onClick={saveGraph} disabled={saving} style={{ padding: '6px 12px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={() => setShowLanes(!showLanes)} style={{ padding: '6px 12px', background: showLanes ? '#8b5cf6' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {showLanes ? '▦ Calles ON' : '▦ Calles OFF'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            {/* Swimlanes overlay */}
            {showLanes && departments.length > 0 && (
              <div className="swimlane-container">
                {departments.map((dept, i) => (
                  <div
                    key={dept.id}
                    className="swimlane"
                    style={{
                      left: getLaneX(i),
                      width: LANE_WIDTH,
                      background: i % 2 === 0 ? 'rgba(79,70,229,.03)' : 'rgba(79,70,229,.06)',
                    }}
                  >
                    <div className="swimlane-header">🏢 {dept.name}</div>
                  </div>
                ))}
              </div>
            )}
          </ReactFlow>
        </div>

        {/* Form Template Panel */}
        {showFormPanel && selectedNode && (
          <div style={{ width: 300, background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>📋 Formulario</span>
              <button onClick={() => setShowFormPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>
            <div style={{ padding: 12, fontSize: 13, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
              Nodo: <strong style={{ color: '#1e293b' }}>{(selectedNode.data as any).title || String(selectedNode.data.label).split('\n')[0]}</strong>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {formFields.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 16 }}>
                  Sin campos. Agrega campos al formulario de esta actividad.
                </p>
              )}
              {formFields.map((field, i) => (
                <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Campo {i + 1}</span>
                    <button onClick={() => removeFormField(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>✕</button>
                  </div>
                  <input
                    value={field.label}
                    onChange={(e) => updateFormField(i, 'label', e.target.value)}
                    placeholder="Etiqueta"
                    className="form-input"
                    style={{ marginBottom: 6, padding: '6px 10px', fontSize: 13 }}
                  />
                  <input
                    value={field.name}
                    onChange={(e) => updateFormField(i, 'name', e.target.value)}
                    placeholder="nombre_campo"
                    className="form-input"
                    style={{ marginBottom: 6, padding: '6px 10px', fontSize: 13 }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select
                      value={field.type}
                      onChange={(e) => updateFormField(i, 'type', e.target.value)}
                      className="form-input"
                      style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
                    >
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="email">Email</option>
                      <option value="date">Fecha</option>
                      <option value="textarea">Área de texto</option>
                      <option value="select">Selección</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={field.required} onChange={(e) => updateFormField(i, 'required', e.target.checked)} />
                      Req.
                    </label>
                  </div>
                  {field.type === 'select' && (
                    <input
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => updateFormField(i, 'options', e.target.value.split(',').map(s => s.trim()))}
                      placeholder="Opciones (separadas por coma)"
                      className="form-input"
                      style={{ marginTop: 6, padding: '6px 10px', fontSize: 13 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 6 }}>
              <button onClick={addFormField} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>+ Campo</button>
              <button onClick={saveFormTemplate} disabled={savingForm} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                {savingForm ? '...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        {/* AI Assistant Panel */}
        <div style={{ width: 320, background: '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #333' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', fontWeight: 700, fontSize: 15 }}>
            🤖 Asistente IA
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {aiMessages.length === 0 && (
              <div style={{ color: '#666', fontSize: 13, padding: 8 }}>
                <p>Escribe, habla o sube una imagen:</p>
                <p style={{ color: '#888' }}>💬 "Crear flujo para contratación"</p>
                <p style={{ color: '#888' }}>🎤 "Agregar actividad Revisión en Legal"</p>
                <p style={{ color: '#888' }}>📷 Sube un diagrama o boceto</p>
              </div>
            )}
            {aiMessages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 8, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: 12,
                  maxWidth: '85%',
                  fontSize: 13,
                  background: msg.role === 'user' ? '#1677ff' : '#16213e',
                  color: '#fff',
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #333', display: 'flex', gap: 6 }}>
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiPrompt(aiPrompt)}
              placeholder="Escribe un comando..."
              style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: '#16213e', color: '#fff', fontSize: 13 }}
            />
            <button
              onClick={() => handleAiPrompt(aiPrompt)}
              style={{ padding: '8px 12px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              →
            </button>
            <button
              onClick={startVoice}
              style={{ padding: '8px 12px', background: isListening ? '#ff4d4f' : '#52c41a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              {isListening ? '⏹' : '🎤'}
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            <button
              onClick={() => imageInputRef.current?.click()}
              style={{ padding: '8px 12px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              title="Subir imagen de diagrama"
            >
              📷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getEdgeColor(flowType: string) {
  switch (flowType) {
    case 'CONDITIONAL': return '#fa8c16';
    case 'ITERATIVE': return '#722ed1';
    case 'PARALLEL': return '#13c2c2';
    default: return '#1677ff';
  }
}
