import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Clock3,
  Cpu,
  Factory,
  Gauge,
  LayoutDashboard,
  Loader2,
  LogOut,
  Play,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import AuthPage from './pages/AuthPage';
import {
  acknowledgeAlert,
  completeMaintenance,
  getAlerts,
  getClaudeStatus,
  getGridHierarchy,
  getGridSummary,
  getHealth,
  getCsrfToken,
  getCurrentUser,
  getMaintenances,
  getModelInfo,
  getRiskRanking,
  getSimulationHistory,
  getTelemetryStatus,
  logout,
  explainAlert,
  predictComponentWithClaude,
  runSimulation,
  setSimulatorConfig,
  setStrategyConfig,
} from './services/api';

const navigation = [
  { id: 'overview', label: 'Resumen', description: 'Vista general de la red', icon: LayoutDashboard },
  { id: 'assets', label: 'Activos', description: 'Subestaciones y equipos', icon: Factory },
  { id: 'alerts', label: 'Alertas', description: 'Eventos que necesitan atención', icon: Bell },
  { id: 'simulator', label: 'Simulador', description: 'Prueba un escenario hipotético', icon: SlidersHorizontal },
  { id: 'operations', label: 'Operaciones', description: 'Mantenimiento y configuración', icon: Settings2 },
];

const statusLabels = {
  NORMAL: 'Normal',
  WARNING: 'Atención',
  CRITICAL: 'Crítico',
  FAILED: 'Fuera de servicio',
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
};

const statusClasses = {
  NORMAL: 'good',
  LOW: 'good',
  WARNING: 'warning',
  MEDIUM: 'warning',
  CRITICAL: 'critical',
  FAILED: 'failed',
  HIGH: 'critical',
};

const displayStatus = (status) => statusLabels[status] || status || 'Sin dato';
const probabilityLabel = (value) => (Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—');
const dateLabel = (value) => (value ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin fecha');
const errorText = (error) => error?.response?.data?.message || error?.message || 'Ocurrió un error inesperado.';

function StatusPill({ value }) {
  return <span className={`status-pill ${statusClasses[value] || 'muted'}`}><span />{displayStatus(value)}</span>;
}

function EmptyState({ icon: Icon = HelpCircle, title, detail }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={21} /></span>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, tone = 'blue' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value ?? '—'}</strong>
