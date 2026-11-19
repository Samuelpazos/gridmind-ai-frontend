import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const BACKEND_BASE_URL = new URL(API_BASE_URL, window.location.origin);
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || '/ws/stream';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getGridHierarchy = () => api.get('/grid');
export const createTransformer = (request) => api.post('/grid/transformers', request);
export const linkTemperatureSensor = (id, sensorCode) =>
  api.patch(`/grid/transformers/${id}/temperature-sensor`, { sensorCode });
export const getArchivedTransformers = () => api.get('/grid/transformers/archived');
export const updateTransformerName = (id, name) =>
  api.patch(`/grid/transformers/${id}/name`, { name });
export const archiveTransformer = (id) => api.delete(`/grid/transformers/${id}`);
export const restoreTransformer = (id) => api.post(`/grid/transformers/${id}/restore`);
export const getGridSummary = () => api.get('/grid/summary');
export const getRiskRanking = () => api.get('/ranking');
export const getComponentReadings = (id) => api.get(`/components/${id}/readings`);
export const getComponentRisk = (id) => api.get(`/components/${id}/risk`);
export const predictComponentWithClaude = (id) => api.post(`/components/${id}/claude-prediction`);

export const getAlerts = () => api.get('/alerts');
export const acknowledgeAlert = (id) => api.post(`/alerts/${id}/ack`);
export const getClaudeStatus = () => api.get('/alerts/ai/status');
export const getTelemetryStatus = () => api.get('/telemetry/status');
export const explainAlert = (id) => api.post(`/alerts/${id}/explanation`);

export const getPredictions = () => api.get('/predictions');
export const runSimulation = (request) => api.post('/simulations', request);
export const getSimulationHistory = () => api.get('/simulations');

export const executeCommand = (commandName, targetId, parameters = {}, operator = 'OPERATOR') =>
  api.post('/commands/execute', { commandName, targetId, parameters, operator });
export const undoCommand = () => api.post('/commands/undo');

export const setStrategyConfig = (strategyName, forceDegradedMode = false) =>
  api.put('/config/strategy', { strategyName, forceDegradedMode });

export const setSimulatorConfig = (active, scenario) =>
  api.put('/config/simulator', { active, scenario });
export const getSimulatorConfig = () => api.get('/config/simulator');

export const getModelInfo = () => api.get('/model/info');
export const getMaintenances = () => api.get('/maintenances');
export const completeMaintenance = (id, resultNotes = 'Mantenimiento completado') =>
  api.post(`/maintenances/${id}/complete`, { resultNotes });

export const getHistoryLogs = () => api.get('/history');
export const getHealth = () => axios.get(new URL('/health', BACKEND_BASE_URL.origin).toString());
export const getCsrfToken = () => api.get('/auth/csrf');
export const getCurrentUser = () => api.get('/auth/me');
const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

async function submitAuthentication(path, body) {
  const page = window.location;
  const secure = page.protocol === 'https:' && BACKEND_BASE_URL.protocol === 'https:';
  const local = page.protocol === 'http:' && BACKEND_BASE_URL.protocol === 'http:'
    && loopbackHosts.has(page.hostname) && loopbackHosts.has(BACKEND_BASE_URL.hostname);
  if (!secure && !local) {
    throw new Error('Abre GridMind y su API mediante HTTPS para iniciar sesión o crear una cuenta.');
  }
  return api.post(path, body);
}

export const registerAccount = (account) => submitAuthentication('/auth/register', account);
export const login = (credentials) => submitAuthentication('/auth/login', credentials);
export const loginWithDemo = () => submitAuthentication('/auth/demo-login');
export const logout = () => api.post('/auth/logout');
export const getDemoReferenceScenario = () => api.get('/demo/reference-scenario');
export const getDemoAccountConfig = () => api.get('/demo/config');
export const getWebSocketUrl = () => {
  const url = new URL(WS_BASE_URL, BACKEND_BASE_URL.origin);
  if (url.protocol === 'https:') url.protocol = 'wss:';
  else if (url.protocol === 'http:') url.protocol = 'ws:';
  return url.toString();
};

export default api;
