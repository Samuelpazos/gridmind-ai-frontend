import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const BACKEND_BASE_URL = new URL(API_BASE_URL, window.location.origin);

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
export const getGridSummary = () => api.get('/grid/summary');
export const getRiskRanking = () => api.get('/ranking');
export const getComponentReadings = (id) => api.get(`/components/${id}/readings`);
export const getComponentRisk = (id) => api.get(`/components/${id}/risk`);
export const predictComponentWithClaude = (id) => api.post(`/components/${id}/claude-prediction`);

export const getAlerts = () => api.get('/alerts');
export const acknowledgeAlert = (id, operator = 'OPERATOR') => api.post(`/alerts/${id}/ack?operator=${operator}`);
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

export const getModelInfo = () => api.get('/model/info');
export const getMaintenances = () => api.get('/maintenances');
export const completeMaintenance = (id, resultNotes = 'Mantenimiento completado') =>
  api.post(`/maintenances/${id}/complete`, { resultNotes });

export const getHistoryLogs = () => api.get('/history');
export const getHealth = () => axios.get(new URL('/health', BACKEND_BASE_URL.origin).toString());
export const getCsrfToken = () => api.get('/auth/csrf');
export const getCurrentUser = () => api.get('/auth/me');
export const registerAccount = (account) => api.post('/auth/register', account);
export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => api.post('/auth/logout');
export const getDemoReferenceScenario = () => api.get('/demo/reference-scenario');

export default api;
