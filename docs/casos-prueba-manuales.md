# Casos de prueba manuales

Estos casos complementan las pruebas automatizadas y requieren un backend
disponible.

| Caso | Pasos | Resultado esperado |
| --- | --- | --- |
| Autenticación local | Abrir la aplicación local e iniciar sesión | Se muestra el contenido operativo y el usuario activo |
| Inventario | Abrir **Activos** y cambiar entre reales y simulados | Cada pestaña muestra únicamente su tipo de equipo |
| Sensor pendiente | Abrir un equipo real sin lectura y vincular su código | Desaparece el estado pendiente cuando el backend confirma la vinculación |
| Archivo reversible | Archivar un equipo y abrir archivados | El equipo deja activos y aparece con opción **Restaurar** |
| Alertas | Filtrar por severidad y reconocer una alerta | El filtro se conserva y la alerta muestra quién la reconoció |
| Simulador | Seleccionar una variable y ejecutar un valor objetivo | Se comparan lectura disponible y escenario sin alterar la lectura operativa |
| IA degradada | Activar y desactivar el modo degradado | La estrategia y el estado de fallback se actualizan tras guardar |
| Mantenimiento | Completar una tarea con notas | La tarea cambia de estado y las notas quedan registradas |
| Telemetría | Observar el resumen durante una actualización | Los indicadores se refrescan sin recargar la página |

Para cada caso se recomienda registrar usuario de prueba, fecha, respuesta
observada y cualquier mensaje de error del navegador.
