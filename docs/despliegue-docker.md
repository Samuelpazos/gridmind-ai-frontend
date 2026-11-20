# Despliegue con Docker y Nginx

El `Dockerfile` utiliza dos etapas:

1. `node:20-alpine` instala dependencias con `npm ci` y genera `dist` mediante
   `npm run build`.
2. `nginx:alpine` sirve los archivos compilados y copia `nginx.conf`.

Para construir y ejecutar la imagen:

```bash
docker build -t gridmind-ai-frontend .
docker run --rm -p 8080:80 gridmind-ai-frontend
```

Nginx aplica el fallback de la SPA a `index.html`, reenvía `/api` y
`/health` al servicio `backend:8080`, y conserva el upgrade de conexión para
`/ws`.

En una red Docker, el nombre `backend` debe resolver al servicio real del
backend. La URL pública y las políticas de cookies/CORS deben coordinarse con
la configuración de ese backend.
