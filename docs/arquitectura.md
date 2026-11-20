# Arquitectura del frontend

GridMind AI es una SPA de React construida con Vite. El punto de entrada es
`src/main.jsx`, que monta `App` dentro de `React.StrictMode` e importa la hoja
global `src/index.css`.

## Capas principales

- `src/App.jsx` coordina la sesión, la navegación y las vistas principales.
- `src/pages/` contiene pantallas especializadas para autenticación, resumen,
  activos, alertas, simulación y operaciones.
- `src/components/` contiene piezas reutilizables como el encabezado, la barra
  lateral y las insignias de estado.
- `src/context/GridContext.jsx` conserva datos compartidos del resumen de red,
  jerarquía, alertas y selección del transformador.
- `src/services/api.js` centraliza las llamadas HTTP y la construcción de la
  URL de WebSocket.
- `src/hooks/useTelemetryStream.js` encapsula la conexión STOMP para
  actualizaciones de telemetría.
- `src/utils/` concentra formateo de fechas, mediciones, probabilidades,
  errores y origen de lecturas.

## Flujo de datos

Las páginas solicitan acciones a `services/api.js`. Las respuestas se reflejan
en el estado local de cada pantalla o se actualizan mediante `refreshData` del
contexto. El contexto realiza una consulta inicial y un sondeo periódico de
tres segundos; las vistas que requieren actualización inmediata también pueden
usar el canal de telemetría.

La aplicación presenta estados de carga, datos ausentes y errores sin alterar
la forma de las respuestas recibidas del backend.
