# Configuración local

## Requisitos

Se necesita Node.js compatible con el proyecto y npm. El backend de GridMind
debe estar disponible si se quieren consultar datos, autenticarse o probar
operaciones que usan la API.

```bash
npm install
npm run dev
```

La interfaz queda disponible en `http://localhost:5173`.

## Variables de entorno

La plantilla `.env.example` usa:

```text
VITE_API_BASE_URL=/api
```

En desarrollo, Vite envía `/api` y `/health` a `http://localhost:8080`, y
reenvía `/ws` como WebSocket. Para un frontend separado, `VITE_API_BASE_URL`
debe apuntar a la URL pública del backend terminada en `/api`. La ruta de
WebSocket puede configurarse con `VITE_WS_BASE_URL`.

Las variables `VITE_*` se incorporan al navegador durante la compilación. No
se deben colocar secretos en ellas.

## Comprobaciones

```bash
npm run lint
npm test
npm run build
```
