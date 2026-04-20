# Reglas de Oro para la Ejecución de IAs

Estas reglas son de cumplimiento obligatorio para cualquier asistente de código que trabaje en este repositorio. Su objetivo es garantizar la calidad, evitar alucinaciones y asegurar que cada cambio sea auditable.

## 1. Descomposición Obligatoria de Tareas (Tarea 26.2)
Si una tarea implica > 80 líneas de código nuevas o > 3 archivos nuevos, **DEBE descomponerse** en sub-tareas atómicas.

- **Límite por sub-tarea:** Máximo 30 líneas de código o 1 archivo.
- **Flujo por sub-tarea:** Cada sub-tarea debe seguir el flujo: Implementar → Auditar → Marcar → Commit → Build.
- **Protocolo de inicio:** Antes de empezar una tarea grande, el agente debe listar las sub-tareas en el chat y esperar el "ok" del usuario.

## 2. Modo "Smoke Test" Cierre de Fase (Tarea 26.3)
Tras completar TODA una fase (ej. Fase 26 completa), el agente debe ejecutar y pasar:
1. `npm run build`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `bash scripts/check-no-hardcode.sh`
5. Verificación visual si hubo cambios en UI.

**Entregable:** Un commit explícito `chore: cierre fase X — todos los checks pasan`.

## 3. Protocolo de Escalada - Regla de los 3 Intentos (Tarea 26.4)
Si después de **3 intentos** una sub-tarea sigue fallando:
1. **DETENER** la ejecución de inmediato.
2. **REPORTAR** detalladamente: qué se intentó, errores recibidos e hipótesis.
3. **PROPONER** opciones: (a) revisión manual, (b) consulta externa, (c) saltar y volver.
4. **NO AVANZAR** a la siguiente sub-tarea sin resolución.

## 4. Validación Pre-deploy (Tarea 26.5)
Antes de deployar a producción (Fase 10):
1. Probar manualmente los 10 escenarios de evaluación (Fase 11.1).
2. Calificar calidad de voz, datos reales y avance de venta.
3. **Umbral:** Promedio ≥ 7/10. Si es menor, se vuelve a la Fase 13.
