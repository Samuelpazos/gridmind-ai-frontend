# Mantenimiento e historial

El área de operaciones reúne las tareas de mantenimiento y los registros de
actividad. Las consultas se centralizan en `getMaintenances` y
`getHistoryLogs`.

## Mantenimiento

Cada tarea puede mostrar equipo, fecha, estado y notas. Al completar una tarea,
la pantalla envía el identificador y las notas mediante
`completeMaintenance`. Después de una respuesta correcta se refrescan los
datos para que el estado visible coincida con el backend.

## Historial

El historial sirve para revisar operaciones ejecutadas y cambios relevantes.
Debe consultarse como una bitácora: no sustituye la lectura actual del activo
ni modifica por sí mismo el estado operativo.

## Comandos reversibles

Las acciones administrativas se envían mediante `executeCommand`. Cuando el
backend ofrece una operación reversible, el frontend expone `undoCommand` para
solicitar el último deshacer disponible. El botón de deshacer debe utilizarse
solo después de verificar el objetivo y el resultado de la operación.
