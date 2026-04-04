import { Injectable } from '@nestjs/common';

export interface DiagramAction {
  action: 'add_node' | 'connect' | 'remove_node' | 'suggest_flow';
  nodes?: { title: string; department: string }[];
  connections?: { from: string; to: string; flowType: string }[];
  suggestion?: string;
}

@Injectable()
export class AiAssistantService {
  /**
   * Parse a text prompt and return diagram actions.
   * This is a rule-based NLP engine that understands common patterns.
   * Can be extended with OpenAI/Gemini API later.
   */
  parsePrompt(prompt: string): DiagramAction {
    const lower = prompt.toLowerCase().trim();

    // Pattern: "agregar actividad X en departamento Y"
    const addMatch = lower.match(/agregar?\s+(?:actividad|nodo|tarea|paso)\s+["""]?(.+?)["""]?\s+(?:en|al?\s+departamento|para)\s+["""]?(.+?)["""]?$/i);
    if (addMatch) {
      return {
        action: 'add_node',
        nodes: [{ title: this.capitalize(addMatch[1]), department: this.capitalize(addMatch[2]) }],
      };
    }

    // Pattern: "conectar X con Y" or "X va a Y"
    const connectMatch = lower.match(/conectar?\s+["""]?(.+?)["""]?\s+(?:con|a|hacia)\s+["""]?(.+?)["""]?$/i)
      || lower.match(/["""]?(.+?)["""]?\s+(?:va a|lleva a|fluye a|pasa a)\s+["""]?(.+?)["""]?$/i);
    if (connectMatch) {
      return {
        action: 'connect',
        connections: [{ from: this.capitalize(connectMatch[1]), to: this.capitalize(connectMatch[2]), flowType: 'SEQUENTIAL' }],
      };
    }

    // Pattern: "eliminar X" or "quitar X"
    const removeMatch = lower.match(/(?:eliminar?|quitar?|borrar?|remover?)\s+(?:actividad|nodo|tarea|paso)?\s*["""]?(.+?)["""]?$/i);
    if (removeMatch) {
      return {
        action: 'remove_node',
        nodes: [{ title: this.capitalize(removeMatch[1]), department: '' }],
      };
    }

    // Pattern: "crear flujo para proceso de X" — suggest a basic workflow
    const flowMatch = lower.match(/(?:crear?|generar?|sugerir?|diseñar?)\s+(?:flujo|proceso|workflow|diagrama)\s+(?:para|de)\s+["""]?(.+?)["""]?$/i);
    if (flowMatch) {
      const process = this.capitalize(flowMatch[1]);
      return {
        action: 'suggest_flow',
        suggestion: process,
        nodes: [
          { title: `Recibir solicitud de ${process}`, department: 'Ventas' },
          { title: `Revisar ${process}`, department: 'Legal' },
          { title: `Aprobar ${process}`, department: 'Finanzas' },
        ],
        connections: [
          { from: `Recibir solicitud de ${process}`, to: `Revisar ${process}`, flowType: 'SEQUENTIAL' },
          { from: `Revisar ${process}`, to: `Aprobar ${process}`, flowType: 'SEQUENTIAL' },
        ],
      };
    }

    // Fallback: try to extract something useful
    return {
      action: 'add_node',
      nodes: [{ title: this.capitalize(lower), department: '' }],
      suggestion: 'No entendí bien. Intenta algo como: "agregar actividad Revisión en Legal" o "crear flujo para contratación"',
    };
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
