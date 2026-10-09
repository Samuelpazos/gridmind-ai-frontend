# GridMind AI - Frontend Application

Aplicación Frontend en React 18, Vite, JavaScript y Recharts con estética empresarial SCADA de centro de control de energía.

## Características
- **12 Pantallas completas de monitoreo y administración**:
  1. Dashboard Principal (KPIs, desglose de estados, vista rápida de red)
  2. Monitoreo de Red (Árbol jerárquico Composite: Subestación -> Transformador -> Sensores)
  3. Detalle de Transformador (Indicadores de probabilidad, gráficas temporales Recharts, explicabilidad de IA)
  4. Alertas (Tabla de alertas con filtrado y modal de reconocimiento)
  5. Ranking de Riesgo (Tabla de prioridad Riesgo x Impacto)
  6. Historial (Línea de tiempo de auditoría de eventos)
  7. Simulador de Fallas (Laboratorio de simulación comparativa de escenarios hipotéticos)
  8. Mantenimiento (Recomendaciones, programación y restablecimiento a estado NORMAL)
  9. Administración (Gestión del simulador y escenarios de telemetría)
  10. Configuración de IA (Selección de estrategia: Threshold, IsolationForest, SupervisedModel, WeightedAge y Fallback RNF-08)
  11. Información del Modelo (Métricas Precision, Recall >85%, F1, ROC-AUC, Importancia de Variables y Prueba del Escenario de Referencia Sección 8)
  12. Estado del Sistema (Salud del backend, PostgreSQL, WebSocket y diagnósticos)

- **Telemetría en tiempo real**: Latencia &lt; 3s.
- **Diseño Responsive & Modo Oscuro SCADA**.

## Ejecución Local
```bash
npm install
npm run dev
```
Acceder en el navegador a `http://localhost:5173`

Para desarrollo local, Vite reenvía `/api`, `/health` y `/ws` al backend local. Si el frontend se despliega aparte, crea un archivo `.env` para el build con `VITE_API_BASE_URL` apuntando a la URL del backend y terminando en `/api`; ver `.env.example`. El backend debe permitir el origen del frontend mediante `CORS_ALLOWED_ORIGIN_PATTERNS`.

## Despliegue del frontend en Vercel

Importa el repositorio del frontend en Vercel. El directorio raíz del proyecto debe ser `frontend` si importas el repositorio completo; si conectas el repositorio independiente del frontend, usa su raíz. Vercel detecta Vite y utiliza `npm run build` con `dist` como directorio de salida. `vercel.json` habilita el fallback de la SPA para las rutas internas.

Configura `VITE_API_BASE_URL` en las variables de entorno de Vercel con la URL HTTPS pública del backend terminada en `/api` (por ejemplo, `https://api.example.com/api`) y vuelve a desplegar. No pongas claves de Claude ni otros secretos en variables `VITE_*`: estas variables se incorporan al JavaScript público. Vercel aloja aquí el frontend estático; Spring Boot y PostgreSQL necesitan servicios de alojamiento externos.

La autenticación usa cookies de sesión y CSRF. Antes de producción, configura el backend para el dominio real, HTTPS y CORS. Si frontend y backend están en sitios distintos, la cookie `SameSite=Lax` actual puede impedir que la sesión funcione; conviene mantenerlos bajo el mismo sitio o elegir y probar una estrategia de proxy/autenticación adecuada antes de publicar.
