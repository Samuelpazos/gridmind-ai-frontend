# API consumida por el frontend

Las funciones de `src/services/api.js` usan Axios con credenciales habilitadas,
JSON como tipo de contenido y protección XSRF mediante la cookie
`XSRF-TOKEN`.

## Recursos principales

| Área | Operaciones |
| --- | --- |
| Red y activos | `/grid`, `/grid/summary`, creación, nombre, sensor, archivado y restauración |
| Componentes | lecturas, riesgo y predicción manual |
| Alertas | listado, reconocimiento, estado de IA y asistente |
| Simulación | `/simulations` y configuración del simulador |
| Operaciones | comandos, deshacer, mantenimientos e historial |
| Configuración | estrategia de IA, información del modelo y estado de salud |
| Sesión | CSRF, usuario actual, registro, inicio y cierre de sesión |

Las acciones mutables se exponen como funciones con nombres explícitos, por
ejemplo `archiveTransformer`, `runSimulation` o `completeMaintenance`. Las
páginas no construyen URLs directamente; reutilizan estas funciones para
mantener una única definición del contrato frontend-backend.

## Diagnóstico

Un error de Axios puede exponer el mensaje devuelto por el backend mediante
`src/utils/requestError.js`. Si una llamada falla, conviene revisar la ruta,
el estado HTTP, la sesión y la configuración de origen antes de repetir la
operación.
