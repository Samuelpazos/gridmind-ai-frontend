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
        <small>{helper}</small>
      </div>
    </article>
  );
}

function AssetTable({ assets, onSelect, onPredict, claudeEnabled, predictingId }) {
  if (!assets.length) {
    return <EmptyState icon={Factory} title="Aún no hay activos" detail="Cuando el backend y PostgreSQL estén conectados, tus transformadores aparecerán aquí." />;
  }

  return (
    <div className="table-scroll">
      <table className="asset-table">
        <thead>
          <tr><th>Activo</th><th>Subestación</th><th>Estado</th><th>Probabilidad de falla</th><th>Potencia</th>{onPredict && <th>Acción</th>}</tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} onClick={() => onSelect?.(asset.id)} className={onSelect ? 'clickable-row' : ''}>
              <td><span className="asset-name"><span className="asset-glyph"><Zap size={15} /></span><span><strong>{asset.name || asset.code}</strong><small>{asset.code}</small></span></span></td>
              <td>{asset.substationName || '—'}</td>
              <td><StatusPill value={asset.status} /></td>
              <td><span className="risk-cell">{probabilityLabel(asset.failureProbability)}</span><span className="risk-track"><i style={{ width: `${Math.min(100, Math.max(0, (asset.failureProbability || 0) * 100))}%` }} /></span></td>
              <td>{asset.ratingKva ? `${Number(asset.ratingKva).toLocaleString('es-CO')} kVA` : '—'}</td>
              {onPredict && <td><button className="button button-outline compact" disabled={!claudeEnabled || predictingId === asset.id} onClick={(event) => { event.stopPropagation(); onPredict(asset.id); }} title={claudeEnabled ? 'Solicitar estimación manual a Claude' : 'Configura CLAUDE_API_KEY para habilitar Claude'}>{predictingId === asset.id ? <Loader2 className="spin" size={14} /> : <Sparkles size={14} />}{predictingId === asset.id ? 'Consultando…' : 'Predecir con Claude'}</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Overview({ summary, assets, ranking, alerts, setPage, loading }) {
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged);
  const focusAssets = [...assets].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)).slice(0, 4);
  const statusCounts = [
    { key: 'NORMAL', label: 'Estables', value: summary?.normalComponents || 0 },
    { key: 'WARNING', label: 'En observación', value: summary?.warningComponents || 0 },
    { key: 'CRITICAL', label: 'Críticos', value: summary?.criticalComponents || 0 },
    { key: 'FAILED', label: 'Fuera de servicio', value: summary?.failedComponents || 0 },
  ];
  const totalStates = statusCounts.reduce((total, item) => total + item.value, 0);

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow light">CENTRO DE CONTROL · GRIDMIND AI</span>
          <h2>Una visión clara de tu red eléctrica.</h2>
          <p>Revisa el estado de los activos, atiende alertas y prueba escenarios desde un solo lugar.</p>
          <button className="button button-light" onClick={() => setPage('assets')}>Ver activos <ArrowUpRight size={16} /></button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <span className="orbit-node node-one" /><span className="orbit-node node-two" />
          <span className="orbit-node node-three" /><span className="orbit-core"><Zap size={32} /></span>
        </div>
      </section>

      <section className="stats-grid" aria-label="Indicadores principales">
        <StatCard icon={Factory} label="Subestaciones" value={summary?.totalSubstations} helper="Instalaciones conectadas" tone="blue" />
        <StatCard icon={Zap} label="Transformadores" value={summary?.totalTransformers} helper="Activos en seguimiento" tone="violet" />
        <StatCard icon={Activity} label="Sensores activos" value={summary?.activeSensors} helper="Telemetría disponible" tone="green" />
        <StatCard icon={Bell} label="Alertas pendientes" value={summary?.pendingAlerts ?? activeAlerts.length} helper="Requieren revisión" tone="orange" />
      </section>

      <section className="content-grid">
        <article className="surface-card status-overview">
          <div className="card-heading">
            <div><span className="eyebrow">ESTADO DE LA RED</span><h3>Salud de los componentes</h3></div>
            <button className="text-button" onClick={() => setPage('assets')}>Ver activos <ArrowUpRight size={15} /></button>
          </div>
          {totalStates === 0 && loading ? <div className="loading-line"><Loader2 className="spin" size={18} /> Cargando estado de la red…</div> : (
            <>
              <div className="status-total"><strong>{totalStates}</strong><span>componentes evaluados</span></div>
              <div className="status-bar" aria-label="Distribución de estados">
                {statusCounts.map((item) => <span key={item.key} className={`bar-${item.key.toLowerCase()}`} style={{ width: `${totalStates ? (item.value / totalStates) * 100 : 0}%` }} />)}
              </div>
              <div className="status-legend">
                {statusCounts.map((item) => <div key={item.key}><i className={`legend-dot ${statusClasses[item.key]}`} /><span>{item.label}</span><strong>{item.value}</strong></div>)}
              </div>
            </>
          )}
        </article>

        <article className="surface-card quick-alerts">
          <div className="card-heading">
            <div><span className="eyebrow">ATENCIÓN REQUERIDA</span><h3>Alertas recientes</h3></div>
            <button className="count-chip" onClick={() => setPage('alerts')}>{activeAlerts.length} abiertas</button>
          </div>
          {activeAlerts.length ? (
            <div className="compact-alert-list">
              {activeAlerts.slice(0, 3).map((alert) => (
                <button className="compact-alert" key={alert.id} onClick={() => setPage('alerts')}>
                  <span className={`alert-mark ${statusClasses[alert.severity] || 'warning'}`}><AlertTriangle size={16} /></span>
                  <span className="compact-alert-copy"><strong>{alert.transformerCode || alert.transformerName || 'Alerta de red'}</strong><small>{alert.message}</small></span>
                  <ArrowDownRight size={16} />
                </button>
              ))}
            </div>
          ) : <EmptyState icon={ShieldCheck} title="Todo bajo control" detail="No hay alertas pendientes." />}
        </article>
      </section>

      <section className="surface-card">
        <div className="card-heading">
          <div><span className="eyebrow">PRIORIZACIÓN INTELIGENTE</span><h3>Activos que merecen atención</h3></div>
          <button className="text-button" onClick={() => setPage('assets')}>Ver lista completa <ArrowUpRight size={15} /></button>
        </div>
        <AssetTable assets={focusAssets.length ? focusAssets : ranking.map((item) => ({ ...item, id: item.transformerId }))} />
      </section>
    </div>
  );
}

function AssetsPage({ substations, assets, onSelect, onClaudePredict, claudeEnabled, predictingId }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
