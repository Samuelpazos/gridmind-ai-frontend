# Despliegue en Vercel

El proyecto incluye `vercel.json` con una regla que redirige las rutas de la
SPA a `index.html`. Esto permite cargar directamente una pantalla interna sin
que Vercel responda con un 404 del sistema de archivos.

## Configuración

1. Importar el repositorio y seleccionar su raíz como directorio del proyecto.
2. Usar `npm run build` como comando de compilación.
3. Configurar `dist` como directorio de salida.
4. Definir `VITE_API_BASE_URL` con la URL HTTPS pública terminada en `/api`.
5. Configurar en el backend el origen exacto del frontend.

El backend Spring Boot y PostgreSQL se despliegan por separado. El frontend
solo contiene el cliente y no debe recibir credenciales privadas.

Si frontend y backend están en sitios distintos, hay que comprobar HTTPS,
CORS, cookies de sesión y la URL de WebSocket antes de validar el acceso de
usuarios.
