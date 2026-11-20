# GridMind AI · Frontend

React, Vite, JavaScript, Recharts, and Lucide power the Spanish-language monitoring interface. Operators can review network status, manage real and simulated transformers, inspect readings, run what-if scenarios, ask about alerts, and use maintenance and analysis controls.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api`, `/health`, and `/ws` to the local backend. Run `npm run lint` and `npm run build` to verify the application.

## Deploy on Vercel

Import the frontend repository using its root, or set the root directory to `frontend` when importing the full project. Use `npm run build` with `dist` as output. The SPA fallback is configured in `vercel.json`.

Set `VITE_API_BASE_URL` to the public backend HTTPS URL ending in `/api` and redeploy. Keep secrets out of `VITE_*` variables because they are bundled into public JavaScript. Spring Boot and PostgreSQL need separate hosting.

The API uses session cookies and CSRF. Configure the production frontend origin in `CORS_ALLOWED_ORIGIN_PATTERNS`. Cross-site deployments may be blocked by the `SameSite=Lax` session cookie. Use a same-site deployment or verify an appropriate proxy and authentication configuration.

## Operator guides

The guides are in Spanish to match the interface.

- [Sign in](docs/acceso.md)
- [Manage transformers](docs/activos.md)
- [Run a simulation](docs/simulador.md)
- [Walk through the demo](docs/demo.md)
