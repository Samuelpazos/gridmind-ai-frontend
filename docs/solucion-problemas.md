# Solución de problemas

## La API no responde

En desarrollo, comprobar que el backend escuche en `localhost:8080` y que la
aplicación se abra en `localhost:5173`. Revisar el proxy definido en
`vite.config.js` y la pestaña Network del navegador.

## El inicio de sesión exige HTTPS

Usar HTTPS en la página y en `VITE_API_BASE_URL`. La única excepción
intencionada es el desarrollo local mediante loopback HTTP.

## La sesión se pierde

Comprobar `withCredentials`, CORS y la política `SameSite` de la cookie. En
despliegues cruzados, el origen configurado en el backend debe coincidir con la
URL pública del frontend.

## No llegan lecturas en tiempo real

Verificar `VITE_WS_BASE_URL`, el endpoint `/ws/stream`, el upgrade de Nginx y
la conexión STOMP. El frontend conserva un sondeo periódico, por lo que una
falla del canal WebSocket no implica necesariamente que la API no pueda
consultarse.

## Faltan valores en pantalla

Distinguir entre un valor realmente cero y una lectura ausente. La interfaz
usa `Sin lectura` o `—` para datos no disponibles. Revisar la respuesta del
endpoint antes de diagnosticar un problema de formato.

## La compilación falla

Ejecutar `npm install` si faltan dependencias y después repetir `npm test`,
`npm run lint` y `npm run build` por separado para localizar la etapa fallida.
