import { useCallback, useEffect, useState } from 'react';
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
    const newNode: Node = {
      id: crypto.randomUUID(),
      position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
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
          const node: Node = {
            id: crypto.randomUUID(),
            position: { x: 100 + i * 250, y: 100 + i * 120 },
            data: { label: `${n.title}\n(${dept?.name || n.department})`, departmentId: dept?.id || departments[0]?.id, title: n.title },
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
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* AI Assistant Panel */}
        <div style={{ width: 320, background: '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #333' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', fontWeight: 700, fontSize: 15 }}>
            🤖 Asistente IA
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {aiMessages.length === 0 && (
              <div style={{ color: '#666', fontSize: 13, padding: 8 }}>
                <p>Escribe o habla para diseñar tu diagrama:</p>
                <p style={{ color: '#888' }}>"Crear flujo para contratación"</p>
                <p style={{ color: '#888' }}>"Agregar actividad Revisión en Legal"</p>
                <p style={{ color: '#888' }}>"Conectar Revisión con Aprobación"</p>
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
