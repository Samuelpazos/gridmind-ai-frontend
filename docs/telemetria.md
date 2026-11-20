# Telemetría y actualización de datos

GridMind distingue entre lecturas de hardware, lecturas simuladas y lecturas
mixtas. `src/utils/telemetry.js` traduce esos valores a etiquetas breves o
expandidas para la interfaz.

## Sondeo del contexto

`GridContext` solicita el resumen, la jerarquía de red y las alertas al montar
el proveedor y repite la actualización cada tres segundos. El intervalo se
limpia cuando el proveedor se desmonta.

Este mecanismo permite que las pantallas reciban datos recientes incluso si el
canal en tiempo real no está disponible.

## Canal STOMP

`useTelemetryStream` calcula la URL con `getWebSocketUrl`, activa un cliente
STOMP y se suscribe a `/topic/telemetry`. Al conectarse realiza una
actualización inmediata. Los eventos recibidos agrupan la actualización en una
ventana corta para evitar múltiples refrescos consecutivos.

Los estados visibles del hook son `connecting`, `connected` y `disconnected`.
La reconexión usa un retraso de cinco segundos. Al desmontar el componente, se
limpia el temporizador y se desactiva el cliente.

## Lecturas ausentes

Una lectura inexistente no debe interpretarse como cero. Las utilidades de
medición muestran `Sin lectura`, mientras que los porcentajes desconocidos se
representan con `—`.
