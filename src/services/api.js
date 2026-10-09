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

