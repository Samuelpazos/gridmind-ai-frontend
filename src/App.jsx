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
  const filtered = assets.filter((asset) => {
    const matchesQuery = `${asset.name || ''} ${asset.code || ''} ${asset.substationName || ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === 'ALL' || asset.status === filter);
  });

  return (
    <div className="page-stack">
      <SectionHeading eyebrow="INVENTARIO DE RED" title="Activos" description="Explora las subestaciones y localiza rápidamente un transformador." />
      <div className={`notice-banner ${claudeEnabled ? '' : 'error-banner'}`}><Sparkles size={17} /><span>{claudeEnabled ? 'Las predicciones de Claude se ejecutan manualmente al pulsar el botón de cada transformador; no se consulta la API en cada lectura.' : 'Para hacer predicciones con Claude, configura CLAUDE_API_KEY en el entorno del backend y reinícialo. Las predicciones locales Smile siguen funcionando.'}</span></div>
      <section className="surface-card">
        <div className="toolbar">
          <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar activo o subestación" /></label>
          <label className="select-wrap"><span>Estado</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">Todos</option><option value="NORMAL">Normal</option><option value="WARNING">Atención</option><option value="CRITICAL">Crítico</option><option value="FAILED">Fuera de servicio</option></select><ChevronDown size={15} /></label>
        </div>
        <AssetTable assets={filtered} onSelect={onSelect} onPredict={onClaudePredict} claudeEnabled={claudeEnabled} predictingId={predictingId} />
      </section>
      <div className="substation-grid">
        {substations.map((substation) => (
          <article className="substation-card" key={substation.id}>
            <div className="substation-top"><span className="substation-symbol"><Factory size={18} /></span><StatusPill value={substation.status} /></div>
            <h3>{substation.name || substation.code}</h3>
            <p>{substation.location || substation.type || 'Subestación eléctrica'}</p>
            <div className="substation-foot"><span><Zap size={14} />{substation.transformers?.length || 0} transformadores</span><span>{substation.code}</span></div>
          </article>
        ))}
      </div>
      {!substations.length && <div className="surface-card"><EmptyState icon={Factory} title="No hay subestaciones disponibles" detail="Verifica que los servicios Docker estén activos y vuelve a cargar los datos." /></div>}
    </div>
  );
}

function AlertsPage({ alerts, onAcknowledge, onExplain, explanations, explanationErrors, claudeEnabled, explainingId, pendingId }) {
  const [filter, setFilter] = useState('OPEN');
  const visible = alerts.filter((alert) => filter === 'ALL' || (filter === 'OPEN' ? !alert.acknowledged : alert.acknowledged));
  return (
    <div className="page-stack">
      <SectionHeading eyebrow="CENTRO DE ATENCIÓN" title="Alertas" description="Identifica el activo, entiende el evento y registra cuándo fue revisado." action={<label className="select-wrap"><span>Mostrar</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="OPEN">Pendientes</option><option value="ALL">Todas</option><option value="DONE">Reconocidas</option></select><ChevronDown size={15} /></label>} />
      {!claudeEnabled && <div className="notice-banner"><Sparkles size={17} /><span>El asistente Claude no está configurado. Añade <code>CLAUDE_API_KEY</code> al archivo `.env` y reinicia el backend para habilitar explicaciones.</span></div>}
      <div className="alert-page-list">
        {visible.map((alert) => (
          <article className={`alert-card ${alert.acknowledged ? 'acknowledged' : ''}`} key={alert.id}>
            <span className={`alert-mark large ${statusClasses[alert.severity] || 'warning'}`}><AlertTriangle size={19} /></span>
            <div className="alert-main">
              <div className="alert-title-row"><h3>{alert.transformerCode || alert.transformerName || 'Evento de la red'}</h3><StatusPill value={alert.severity} /></div>
              <p>{alert.message || 'Se detectó un cambio en el estado del activo.'}</p>
              <div className="alert-meta"><span><Factory size={14} />{alert.substationName || 'Subestación sin identificar'}</span><span><Clock3 size={14} />{dateLabel(alert.createdAt)}</span>{alert.acknowledged && <span><CheckCircle2 size={14} />Revisada por {alert.acknowledgedBy || 'operador'}</span>}</div>
              <div className="ai-explanation-actions">
                <button className="button button-outline compact" onClick={() => onExplain(alert.id)} disabled={!claudeEnabled || explainingId === alert.id} title={claudeEnabled ? 'Generar explicación con Claude' : 'Configura CLAUDE_API_KEY para habilitar Claude'}>
                  {explainingId === alert.id ? <Loader2 className="spin" size={15} /> : <Sparkles size={15} />}
                  {explainingId === alert.id ? 'Consultando Claude…' : 'Explicar con Claude'}
                </button>
                {explanationErrors[alert.id] && <span className="ai-error">{explanationErrors[alert.id]}</span>}
              </div>
              {explanations[alert.id] && <div className="ai-explanation"><Sparkles size={16} /><div><strong>Explicación de Claude</strong><p>{explanations[alert.id].explanation}</p><small>{explanations[alert.id].model} · {dateLabel(explanations[alert.id].generatedAt)}</small></div></div>}
            </div>
            {!alert.acknowledged && <button className="button button-outline" onClick={() => onAcknowledge(alert.id)} disabled={pendingId === alert.id}>{pendingId === alert.id ? <Loader2 className="spin" size={16} /> : <Check size={16} />} Marcar revisada</button>}
          </article>
        ))}
        {!visible.length && <div className="surface-card"><EmptyState icon={ShieldCheck} title={filter === 'OPEN' ? 'Sin alertas pendientes' : 'No hay alertas para mostrar'} detail="Cuando la red genere un evento, aparecerá aquí con su estado y hora." /></div>}
      </div>
    </div>
  );
}

function SimulatorPage({ assets, history, onRefresh, selectedAssetId, onError }) {
  const [transformerId, setTransformerId] = useState(selectedAssetId || '');
  const [variableModified, setVariableModified] = useState('TEMPERATURE');
  const [deltaPercent, setDeltaPercent] = useState(25);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (selectedAssetId && assets.some((asset) => asset.id === selectedAssetId)) {
      setTransformerId(selectedAssetId);
    }
  }, [assets, selectedAssetId]);

  useEffect(() => {
    if (!transformerId && assets.length) {
      setTransformerId(assets[0].id);
    }
  }, [assets, transformerId]);

  const simulate = async (event) => {
    event.preventDefault();
    setRunning(true);
    setResult(null);
    try {
      const response = await runSimulation({ transformerId, variableModified, deltaPercent: Number(deltaPercent) });
      setResult(response.data);
      await onRefresh();
    } catch (error) {
      onError(error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page-stack">
      <SectionHeading eyebrow="LABORATORIO WHAT-IF" title="Simulador de escenarios" description="Explora el efecto de una variación sin alterar las lecturas operativas reales." />
      <div className="simulation-layout">
        <form className="surface-card simulation-form" onSubmit={simulate}>
          <div className="card-heading"><div><span className="eyebrow">CONFIGURA UNA PRUEBA</span><h3>Escenario hipotético</h3></div><span className="form-icon"><SlidersHorizontal size={18} /></span></div>
          <label className="field-label">Transformador
            <select required value={transformerId} onChange={(event) => setTransformerId(event.target.value)} disabled={!assets.length}>
              {assets.length ? assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.code} · {asset.name}</option>) : <option value="">Sin activos disponibles</option>}
            </select>
          </label>
          <label className="field-label">Variable que quieres modificar
            <select value={variableModified} onChange={(event) => setVariableModified(event.target.value)}>
              <option value="TEMPERATURE">Temperatura</option><option value="VIBRATION">Vibración</option><option value="CURRENT">Corriente</option><option value="VOLTAGE">Voltaje</option>
            </select>
          </label>
          <label className="field-label">Aumento simulado <strong className="range-value">+{deltaPercent}%</strong>
            <input className="range-input" type="range" min="5" max="100" step="5" value={deltaPercent} onChange={(event) => setDeltaPercent(event.target.value)} />
            <span className="range-ends"><small>+5%</small><small>+100%</small></span>
          </label>
          <button type="submit" className="button button-primary button-wide" disabled={running || !assets.length}>{running ? <Loader2 className="spin" size={17} /> : <Play size={16} fill="currentColor" />} {running ? 'Evaluando escenario…' : 'Ejecutar simulación'}</button>
          <p className="privacy-note"><ShieldCheck size={15} />La simulación no cambia la base de datos operativa.</p>
        </form>

        <section className="surface-card result-panel">
          {result ? (
            <>
              <div className="card-heading"><div><span className="eyebrow">RESULTADO DEL MODELO</span><h3>{result.transformerName || result.transformerCode}</h3></div><span className="result-spark"><Sparkles size={19} /></span></div>
              <p className="result-description">{result.variableModified} aumenta un {result.deltaPercent}% en el escenario simulado.</p>
              <div className="comparison-grid">
                <div><span>Estado original</span><StatusPill value={result.originalState} /><strong>{probabilityLabel(result.originalProbability)}</strong><small>Probabilidad de falla</small></div>
                <ArrowUpRight className="comparison-arrow" size={19} />
                <div><span>Estado simulado</span><StatusPill value={result.simulatedState} /><strong>{probabilityLabel(result.simulatedProbability)}</strong><small>Probabilidad de falla</small></div>
              </div>
              <div className="recommendation-box"><Sparkles size={17} /><p><strong>Recomendación del modelo</strong><br />{result.recommendation || 'Revisa las condiciones del activo y repite el análisis con datos actualizados.'}</p></div>
            </>
          ) : (
            <EmptyState icon={Gauge} title="El resultado aparecerá aquí" detail="Elige un transformador, ajusta una variable y ejecuta la simulación para comparar el riesgo." />
          )}
        </section>
      </div>
      <section className="surface-card">
        <div className="card-heading"><div><span className="eyebrow">ACTIVIDAD RECIENTE</span><h3>Simulaciones anteriores</h3></div></div>
        {history.length ? <div className="table-scroll"><table className="asset-table"><thead><tr><th>Activo</th><th>Variable</th><th>Variación</th><th>Estado simulado</th><th>Ejecutada</th></tr></thead><tbody>{history.slice(0, 8).map((entry) => <tr key={entry.simulationId}><td><strong>{entry.transformerCode || entry.transformerName}</strong></td><td>{entry.variableModified}</td><td>+{entry.deltaPercent}%</td><td><StatusPill value={entry.simulatedState} /></td><td>{dateLabel(entry.executedAt)}</td></tr>)}</tbody></table></div> : <p className="quiet-note">Aún no hay simulaciones guardadas.</p>}
      </section>
    </div>
  );
}

function OperationsPage({ maintenances, health, modelInfo, telemetryStatus, onComplete, pendingId, onStrategyChange, onSimulatorChange, isAdmin }) {
  const [strategy, setStrategy] = useState(health?.activeStrategy || 'SUPERVISED_MODEL_STRATEGY');
  const [degraded, setDegraded] = useState(Boolean(health?.degradedMode));
  const simulatorActive = Boolean(telemetryStatus?.simulatorActive);

  useEffect(() => {
    setStrategy(health?.activeStrategy || 'SUPERVISED_MODEL_STRATEGY');
    setDegraded(Boolean(health?.degradedMode));
  }, [health]);

  return (
    <div className="page-stack">
      <SectionHeading eyebrow="HERRAMIENTAS DE OPERACIÓN" title="Operaciones" description="Gestiona recomendaciones de mantenimiento y revisa el estado de los servicios." />
      <section className="surface-card">
        <div className="card-heading"><div><span className="eyebrow">PLAN DE TRABAJO</span><h3>Mantenimiento recomendado</h3></div><span className="count-chip">{maintenances.filter((item) => item.status !== 'COMPLETED').length} pendientes</span></div>
        <div className="maintenance-list">
          {maintenances.map((item) => (
            <article className="maintenance-row" key={item.id}>
              <span className={`maintenance-icon ${item.status === 'COMPLETED' ? 'done' : ''}`}>{item.status === 'COMPLETED' ? <Check size={17} /> : <Wrench size={17} />}</span>
              <div className="maintenance-copy"><strong>{item.transformerCode || item.transformerName || 'Activo'}</strong><p>{item.recommendation || 'Revisión preventiva recomendada.'}</p><small>{displayStatus(item.status)} · {dateLabel(item.scheduledDate || item.createdAt)}</small></div>
              {item.status !== 'COMPLETED' && <button className="button button-outline compact" disabled={pendingId === item.id} onClick={() => onComplete(item.id)}>{pendingId === item.id ? <Loader2 className="spin" size={15} /> : <Check size={15} />} Completar</button>}
            </article>
          ))}
          {!maintenances.length && <EmptyState icon={Wrench} title="Sin recomendaciones pendientes" detail="Las recomendaciones generadas para los activos se mostrarán aquí." />}
        </div>
      </section>

      <div className="operations-grid">
        <article className="surface-card">
          <div className="card-heading"><div><span className="eyebrow">SISTEMA DE ANÁLISIS</span><h3>Configuración de IA</h3></div><span className="form-icon"><Cpu size={18} /></span></div>
          <label className="field-label">Estrategia activa
            <select value={strategy} onChange={(event) => setStrategy(event.target.value)} disabled={!isAdmin}>
              <option value="SUPERVISED_MODEL_STRATEGY">Modelo supervisado</option><option value="THRESHOLD_STRATEGY">Reglas por umbral</option><option value="ISOLATION_FOREST_STRATEGY">Isolation Forest</option><option value="WEIGHTED_AGE_STRATEGY">Riesgo y antigüedad</option>
            </select>
          </label>
          <label className="toggle-row"><span><strong>Modo degradado</strong><small>Usa reglas de respaldo si el modelo no responde.</small></span><input type="checkbox" checked={degraded} onChange={(event) => setDegraded(event.target.checked)} disabled={!isAdmin} /></label>
          {isAdmin ? <button className="button button-primary" onClick={() => onStrategyChange(strategy, degraded)}><Check size={16} />Guardar configuración</button> : <p className="quiet-note">Solo una cuenta administradora puede cambiar la configuración del análisis.</p>}
          <p className="quiet-note">{modelInfo?.modelName || modelInfo?.name || 'Modelo de análisis GridMind'}{modelInfo?.version ? ` · ${modelInfo.version}` : ''}</p>
        </article>
        <article className="surface-card system-card">
          <div className="card-heading"><div><span className="eyebrow">SERVICIOS</span><h3>Estado de conexión</h3></div><Activity size={19} className="green-icon" /></div>
          <div className="service-line"><span>API GridMind</span><span className="service-state"><i />{health?.status === 'UP' ? 'En línea' : 'Sin conexión'}</span></div>
          <div className="service-line"><span>Base de datos</span><span className="service-state"><i />{health?.database || 'Esperando conexión'}</span></div>
          <div className="service-line"><span>WebSocket</span><span className="service-state"><i />{health?.websocket || 'No disponible'}</span></div>
          <div className="system-foot"><span>Java 25</span><span>{health?.activeStrategy || 'Estrategia sin cargar'}</span></div>
        </article>
      </div>
      <section className="surface-card">
        <div className="card-heading"><div><span className="eyebrow">MAQUETA FÍSICA</span><h3>Entrada de telemetría</h3></div><span className="count-chip">{telemetryStatus?.hardwareIngestionEnabled ? 'Receptor configurado' : 'Receptor pendiente'}</span></div>
        <div className="service-line"><span>Simulador de datos</span><span className="service-state"><i />{simulatorActive ? 'Activo' : 'Pausado'}</span></div>
        {isAdmin && <button className="button button-outline" disabled={!telemetryStatus || pendingId === 'simulator'} onClick={() => onSimulatorChange(!simulatorActive)}>{pendingId === 'simulator' ? 'Actualizando…' : simulatorActive ? 'Pausar simulador para usar hardware' : 'Reanudar simulador'}</button>}
        {!telemetryStatus?.hardwareIngestionEnabled && <p className="quiet-note">El receptor ESP32 se habilita al configurar TELEMETRY_DEVICE_TOKEN en el backend y reiniciarlo.</p>}
        {!simulatorActive && <p className="quiet-note">El simulador está pausado. Las lecturas de la maqueta podrán entrar sin mezclarse con valores simulados.</p>}
        <p className="quiet-note">{telemetryStatus?.modelValidationNotice || 'La predicción experimental aún debe validarse con mediciones etiquetadas de la maqueta.'}</p>
      </section>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authConnectionError, setAuthConnectionError] = useState('');
  const [page, setPage] = useState('overview');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [summary, setSummary] = useState(null);
  const [substations, setSubstations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [health, setHealth] = useState(null);
  const [telemetryStatus, setTelemetryStatus] = useState(null);
  const [claudeStatus, setClaudeStatus] = useState({ enabled: false, provider: 'Anthropic Claude', model: 'claude-sonnet-4-5' });
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [explainingId, setExplainingId] = useState('');
  const [explanations, setExplanations] = useState({});
  const [explanationErrors, setExplanationErrors] = useState({});
  const [claudePrediction, setClaudePrediction] = useState(null);
  const [claudePredictionError, setClaudePredictionError] = useState('');
  const [predictingAssetId, setPredictingAssetId] = useState('');

  const assets = useMemo(() => substations.flatMap((substation) => (substation.transformers || []).map((asset) => ({
    ...asset,
    substationName: asset.substationName || substation.name,
  }))), [substations]);
  const currentPage = navigation.find((item) => item.id === page) || navigation[0];

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await getCsrfToken();
        const response = await getCurrentUser();
        if (active) setCurrentUser(response.data);
      } catch (error) {
        if (active && error.response?.status !== 401) {
          setAuthConnectionError(error.response?.status === 404
            ? 'El backend aún no tiene la autenticación actualizada. Reinícialo para aplicar el inicio de sesión.'
            : 'No se pudo conectar con el backend. Comprueba que el servicio esté iniciado.');
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    const results = await Promise.allSettled([
      getHealth(),
      getGridSummary(),
      getGridHierarchy(),
      getAlerts(),
      getRiskRanking(),
      getMaintenances(),
      getSimulationHistory(),
      getModelInfo(),
      getClaudeStatus(),
      getTelemetryStatus(),
    ]);
    const [healthResult, summaryResult, gridResult, alertsResult, rankingResult, maintenanceResult, simulationResult, modelResult, claudeResult, telemetryResult] = results;
    const read = (result) => (result.status === 'fulfilled' ? result.value.data : null);

    setHealth(read(healthResult));
    setSummary(read(summaryResult));
    setSubstations(read(gridResult) || []);
    setAlerts(read(alertsResult) || []);
    setRanking(read(rankingResult) || []);
    setMaintenances(read(maintenanceResult) || []);
    setSimulations(read(simulationResult) || []);
    setModelInfo(read(modelResult));
    if (claudeResult.status === 'fulfilled') {
      setClaudeStatus(claudeResult.value.data);
    }
    if (telemetryResult.status === 'fulfilled') {
      setTelemetryStatus(telemetryResult.value.data);
    }
    setUpdatedAt(new Date());

    const failures = results.filter((result) => result.status === 'rejected');
    const apiIsUp = healthResult.status === 'fulfilled' && healthResult.value.data?.status === 'UP';
    if (!apiIsUp) {
      setConnectionError('No se pudo conectar con el backend. Inicia Docker Compose y verifica que PostgreSQL esté saludable.');
    } else if (failures.length) {
      const firstFailure = failures[0];
      setConnectionError(`El backend responde, pero ${failures.length} solicitud(es) de datos fallaron: ${errorText(firstFailure.reason)}`);
      console.error('Falló la carga de datos de GridMind:', failures.map((failure) => failure.reason));
    } else {
      setConnectionError('');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!currentUser) return undefined;
    refreshData();
    const timer = window.setInterval(refreshData, 10000);
    return () => window.clearInterval(timer);
  }, [refreshData, currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('No se pudo cerrar la sesión en el servidor:', error);
    } finally {
      setCurrentUser(null);
      setPage('overview');
    }
  };

  if (authLoading) {
    return <main className="auth-page"><div className="auth-loading"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><p>Conectando con GridMind…</p></div></main>;
  }

  if (!currentUser) {
    return <AuthPage onAuthenticated={(user) => { setCurrentUser(user); setAuthConnectionError(''); }} connectionError={authConnectionError} />;
  }

  const runAction = async (action, successMessage) => {
    setActionError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
      await refreshData();
    } catch (error) {
      setActionError(errorText(error));
      console.error('La acción de GridMind no se pudo completar:', error);
    }
  };

  const handleAcknowledge = async (id) => {
    setPendingId(id);
    await runAction(() => acknowledgeAlert(id), 'Alerta marcada como revisada.');
    setPendingId('');
  };

  const handleExplain = async (id) => {
    setExplainingId(id);
    setExplanationErrors((current) => ({ ...current, [id]: '' }));
    try {
      const response = await explainAlert(id);
      setExplanations((current) => ({ ...current, [id]: response.data }));
    } catch (error) {
      const message = error.response?.data?.message || errorText(error);
      setExplanationErrors((current) => ({ ...current, [id]: message }));
    } finally {
      setExplainingId('');
    }
  };

  const handleClaudePrediction = async (transformerId) => {
    setPredictingAssetId(transformerId);
    setClaudePrediction(null);
    setClaudePredictionError('');
    try {
      const response = await predictComponentWithClaude(transformerId);
      setClaudePrediction(response.data);
    } catch (error) {
      setClaudePredictionError(error.response?.data?.message || errorText(error));
    } finally {
      setPredictingAssetId('');
    }
  };

  const handleMaintenance = async (id) => {
    setPendingId(id);
    await runAction(() => completeMaintenance(id), 'Mantenimiento registrado como completado.');
    setPendingId('');
  };

  const handleStrategyChange = async (strategy, forceDegradedMode) => {
    await runAction(() => setStrategyConfig(strategy, forceDegradedMode), 'Configuración de IA actualizada.');
  };

  const handleSimulatorChange = async (active) => {
    setPendingId('simulator');
    await runAction(() => setSimulatorConfig(active), active
      ? 'Simulador reanudado.'
      : 'Simulador pausado. Ya puedes enviar lecturas físicas de la maqueta.');
    setPendingId('');
  };

  const renderPage = () => {
    if (page === 'assets') return <AssetsPage substations={substations} assets={assets} onSelect={(id) => { setSelectedAssetId(id); setPage('simulator'); }} onClaudePredict={handleClaudePrediction} claudeEnabled={claudeStatus.enabled} predictingId={predictingAssetId} />;
    if (page === 'alerts') return <AlertsPage alerts={alerts} onAcknowledge={handleAcknowledge} onExplain={handleExplain} explanations={explanations} explanationErrors={explanationErrors} claudeEnabled={claudeStatus.enabled} explainingId={explainingId} pendingId={pendingId} />;
    if (page === 'simulator') return <SimulatorPage assets={assets} history={simulations} onRefresh={refreshData} selectedAssetId={selectedAssetId} onError={(error) => { setActionError(errorText(error)); console.error('No se pudo ejecutar la simulación:', error); }} />;
    if (page === 'operations') return <OperationsPage maintenances={maintenances} health={health} modelInfo={modelInfo} telemetryStatus={telemetryStatus} onComplete={handleMaintenance} pendingId={pendingId} onStrategyChange={handleStrategyChange} onSimulatorChange={handleSimulatorChange} isAdmin={currentUser.role === 'ADMIN'} />;
    return <Overview summary={summary} assets={assets} ranking={ranking} alerts={alerts} setPage={setPage} loading={loading} />;
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <button className="brand" onClick={() => setPage('overview')} aria-label="Ir al resumen">
          <span className="brand-mark"><Zap size={20} fill="currentColor" /></span>
          <span className="brand-text"><strong>gridmind<span>AI</span></strong><small>ENERGY MONITORING</small></span>
        </button>
        <div className="workspace-label">ESPACIO DE TRABAJO</div>
        <nav className="side-navigation" aria-label="Navegación principal">
          {navigation.map(({ id, label, description, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)} title={description}>
              <Icon size={18} /><span>{label}</span>{id === 'alerts' && alerts.some((alert) => !alert.acknowledged) && <i className="nav-alert-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><Sparkles size={16} /></span><strong>Red más inteligente</strong><p>Usa el simulador para explorar escenarios sin riesgo.</p><button onClick={() => setPage('simulator')}>Abrir simulador <ArrowUpRight size={14} /></button></div>
          <div className="sidebar-user"><span className="avatar">{currentUser.displayName.slice(0, 2).toUpperCase()}</span><span className="sidebar-user-copy"><strong>{currentUser.displayName}</strong><small>{currentUser.role === 'ADMIN' ? 'Administrador' : 'Operador'}</small></span><button className="logout-button" onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={16} /></button></div>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div className="breadcrumb"><span>GridMind</span><span className="breadcrumb-separator">/</span><strong>{currentPage.label}</strong></div>
          <div className="topbar-actions">
            <span className={`connection-pill ${health?.status === 'UP' ? 'connected' : 'disconnected'}`}><i />{health?.status === 'UP' ? 'Sistema conectado' : 'Sin conexión'}</span>
            <button className="icon-button refresh-button" onClick={refreshData} aria-label="Actualizar datos" disabled={refreshing}><RefreshCw size={17} className={refreshing ? 'spin' : ''} /></button>
            <span className="updated-label">{updatedAt ? `Actualizado ${updatedAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}` : 'Esperando datos'}</span>
          </div>
        </header>

        <div className="mobile-nav">
          {navigation.map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon size={17} /><span>{label}</span></button>)}
        </div>

        <div className="page-container">
          {connectionError && <div className="notice-banner error-banner"><AlertTriangle size={18} /><span>{connectionError}</span><button onClick={refreshData}>Reintentar</button></div>}
          {actionError && <div className="notice-banner error-banner"><AlertTriangle size={18} /><span>{actionError}</span><button onClick={() => setActionError('')}>Cerrar</button></div>}
          {notice && <div className="notice-banner success-banner"><CheckCircle2 size={18} /><span>{notice}</span><button onClick={() => setNotice('')}>Cerrar</button></div>}
          <div className="page-title-row">
            <div><span className="page-kicker">GRIDMIND AI <span>·</span> {currentPage.label.toUpperCase()}</span><h1>{currentPage.id === 'overview' ? `Hola, ${currentUser.displayName}` : currentPage.label}</h1><p>{currentPage.description}</p></div>
            <div className="title-date"><Clock3 size={15} />{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          {renderPage()}
          <footer className="page-footer"><span>GRIDMIND AI <i>·</i> Supervisión de redes eléctricas</span><span>Java 25 <i>·</i> Actualización automática cada 10 s</span></footer>
        </div>
      </main>
      {(claudePrediction || claudePredictionError) && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setClaudePrediction(null); setClaudePredictionError(''); } }}>
          <section className="prediction-dialog" role="dialog" aria-modal="true" aria-labelledby="prediction-dialog-title">
            <div className="dialog-heading"><span className="result-spark"><Sparkles size={19} /></span><button className="icon-button" onClick={() => { setClaudePrediction(null); setClaudePredictionError(''); }} aria-label="Cerrar resultado">×</button></div>
            {claudePredictionError ? (
              <div className="dialog-error"><AlertTriangle size={21} /><h2 id="prediction-dialog-title">No se pudo generar la predicción</h2><p>{claudePredictionError}</p><button className="button button-outline" onClick={() => { setClaudePrediction(null); setClaudePredictionError(''); }}>Cerrar</button></div>
            ) : claudePrediction && (
              <>
                <span className="eyebrow">ESTIMACIÓN SOLICITADA A CLAUDE</span>
                <h2 id="prediction-dialog-title">{claudePrediction.transformerCode} · {claudePrediction.transformerName}</h2>
                <p className="prediction-disclaimer">{claudePrediction.disclaimer}</p>
                <div className="prediction-score"><div><span>Probabilidad estimada de falla</span><strong>{probabilityLabel(claudePrediction.failureProbability)}</strong></div><StatusPill value={claudePrediction.riskLevel} /></div>
                <div className="prediction-measurements"><strong>Lecturas enviadas al modelo</strong><div>{Object.entries(claudePrediction.sensorValues || {}).map(([name, value]) => <span key={name}>{name.replaceAll('_', ' ')} <b>{value}</b></span>)}</div></div>
                <div className="prediction-factors"><strong>Factores considerados</strong><ul>{claudePrediction.topFactors?.map((factor, index) => <li key={`${index}-${factor}`}>{factor}</li>)}</ul></div>
                <div className="recommendation-box"><Sparkles size={17} /><p><strong>Análisis de Claude</strong><br />{claudePrediction.explanation}</p></div>
                <p className="dialog-footnote">{claudePrediction.model} · {dateLabel(claudePrediction.generatedAt)} · Esta estimación no modifica el estado operativo del transformador.</p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
