# Cómo renderizar los diagramas PlantUML

## Opción 1 — Online (más fácil, sin instalar nada)

1. Abrir https://www.plantuml.com/plantuml/uml/
2. Pegar el contenido del archivo .puml
3. Clic en "Submit" → descarga la imagen PNG

O usar: https://editor.plantuml.com/

## Opción 2 — VS Code (recomendado)

1. Instalar extensión: **PlantUML** (jebbs.plantuml)
2. Abrir el archivo .puml
3. `Alt + D` → genera la vista previa
4. Clic derecho → **Export Current Diagram** → PNG o SVG

## Opción 3 — Enterprise Architect

1. Abrir Enterprise Architect
2. Ir a **Tools → Import/Export → Import PlantUML**
   (disponible en EA 15+)
3. O copiar el código PlantUML y pegarlo en un
   diagrama de actividades/componentes

## Opción 4 — Línea de comandos

```bash
# Descargar plantuml.jar desde https://plantuml.com/download
java -jar plantuml.jar *.puml
# Genera un PNG por cada archivo .puml en la carpeta actual
```

---

## Diagramas incluidos

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `01_casos_uso_ciclo2.puml` | Casos de Uso | 25 casos de uso — los 4 roles y los 5 sistemas externos |
| `02_actividades_gestion_documental.puml` | Actividades (calles) | Flujo completo de subida, descarga, colaboración y auditoría |
| `03_actividades_agente_inteligente.puml` | Actividades (calles) | Cliente describe → IA identifica política → inicia trámite |
| `04_componentes_arquitectura.puml` | Componentes | Arquitectura completa: 5 servicios + S3 + Groq |
| `05_actividades_motor_ml.puml` | Actividades (calles) | TensorFlow → predicciones → dashboard con SLA |
