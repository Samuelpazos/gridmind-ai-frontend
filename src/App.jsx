import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Archive,
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
  Plus,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import AuthPage from './pages/AuthPage';
import { simulationMeasurement, simulationNumber } from './utils/measurements';
import { errorText } from './utils/requestError';
import { dateLabel } from './utils/dates';
import { probabilityLabel } from './utils/probability';
import { readingSourceLabel, recentDataSourceLabel } from './utils/telemetry';
import {
  acknowledgeAlert,
  archiveTransformer,
  completeMaintenance,
  createTransformer,
  linkTemperatureSensor,
  getArchivedTransformers,
  getAlerts,
  getClaudeStatus,
  getGridHierarchy,
  getHealth,
  getCsrfToken,
  getCurrentUser,
  getMaintenances,
  getSimulationHistory,
  getSimulatorConfig,
  applyManualTelemetry,
  clearManualTelemetry,
  getTelemetryStatus,
  undoCommand,
  logout,
  askAlertAssistant,
  executeCommand,
  predictComponentWithClaude,
  runSimulation,
  restoreTransformer,
  setSimulatorConfig,
  setStrategyConfig,
  updateTransformerName,
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

function AssetTable({
  assets,
  onSelect,
  onViewDetails,
  onPredict,
  claudeEnabled,
  claudeUnavailableMessage,
  predictingId,
  showAssetType = false,
  manageAssets = false,
  archived = false,
  onEditName,
  onArchive,
  onRestore,
  actionPendingId,
  emptyTitle = 'Aún no hay activos',
  emptyDetail = 'Cuando el backend y PostgreSQL estén conectados, tus transformadores aparecerán aquí.',
}) {
  if (!assets.length) {
    return <EmptyState icon={Factory} title={emptyTitle} detail={emptyDetail} />;
  }

  return (
    <div className="table-scroll">
      <table className="asset-table">
        <thead>
          <tr><th>Transformador</th><th>Subestación</th><th>Estado</th><th>Probabilidad de falla</th><th>Potencia</th>{onPredict && <th>Acción</th>}{manageAssets && <th>Administrar</th>}</tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const rowPending = actionPendingId === `rename-${asset.id}`
              || actionPendingId === `archive-${asset.id}`
              || actionPendingId === `restore-${asset.id}`;
            return (
            <tr key={asset.id} onClick={() => onSelect?.(asset.id)} className={onSelect ? 'clickable-row' : ''}>
              <td><span className="asset-name"><span className="asset-glyph"><Zap size={15} /></span><span><strong>{asset.name || asset.code}</strong><small>{asset.code}</small>{showAssetType && <small className={`asset-kind ${asset.assetType === 'HARDWARE' ? 'hardware' : 'test'}`}>{asset.assetType === 'HARDWARE' ? 'Transformador real' : 'Transformador simulado'}</small>}{archived && asset.archivedAt && <small>Archivado {new Date(asset.archivedAt).toLocaleDateString('es-CO')}</small>}{onViewDetails && <button className="asset-detail-link" onClick={(event) => { event.stopPropagation(); onViewDetails(asset.id); }}>{asset.assetType === 'HARDWARE' && !asset.sensors?.some((sensor) => sensor.latestReading?.source === 'HARDWARE') ? 'Pendiente de conexión' : 'Ver lecturas'}</button>}</span></span></td>
              <td>{asset.substationName || '—'}</td>
              <td><StatusPill value={asset.status} /></td>
              <td><span className="risk-cell">{probabilityLabel(asset.failureProbability)}</span><span className="risk-track"><i style={{ width: `${Math.min(100, Math.max(0, (asset.failureProbability || 0) * 100))}%` }} /></span></td>
              <td>{asset.ratingKva ? `${Number(asset.ratingKva).toLocaleString('es-CO')} kVA` : '—'}</td>
              {onPredict && <td><button className="button button-outline compact" disabled={!claudeEnabled || predictingId === asset.id} onClick={(event) => { event.stopPropagation(); onPredict(asset.id); }} title={claudeEnabled ? 'Solicitar estimación manual a Claude' : claudeUnavailableMessage}>{predictingId === asset.id ? <Loader2 className="spin" size={14} /> : <Sparkles size={14} />}{predictingId === asset.id ? 'Consultando…' : 'Predecir con Claude'}</button></td>}
              {manageAssets && <td><div className="asset-row-actions">
                {archived
                  ? <button type="button" className="button button-outline compact" disabled={rowPending} onClick={(event) => { event.stopPropagation(); onRestore(asset); }} aria-label={`Restaurar ${asset.name || asset.code}`} title="Restaurar al inventario activo">{actionPendingId === `restore-${asset.id}` ? <Loader2 className="spin" size={14} /> : <RotateCcw size={14} />}Restaurar</button>
                  : <>
                    <button type="button" className="icon-button" disabled={rowPending} onClick={(event) => { event.stopPropagation(); onEditName(asset); }} aria-label={`Editar nombre de ${asset.name || asset.code}`} title="Editar nombre"><Pencil size={14} /></button>
                    <button type="button" className="icon-button archive-action" disabled={rowPending} onClick={(event) => { event.stopPropagation(); onArchive(asset); }} aria-label={`Archivar ${asset.name || asset.code}`} title="Archivar transformador">{actionPendingId === `archive-${asset.id}` ? <Loader2 className="spin" size={14} /> : <Archive size={14} />}</button>
                  </>}
              </div></td>}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AssetReadingsDialog({ asset, onClose, onLinkSensor }) {
  const [sensorCode, setSensorCode] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linking, setLinking] = useState(false);
  const canLink = onLinkSensor && asset.assetType === 'HARDWARE' && !asset.archivedAt
    && !asset.sensors?.some((sensor) => sensor.type === 'TEMPERATURE');

  const submitSensor = async (event) => {
    event.preventDefault();
    setLinkError('');
    setLinking(true);
    try {
      await onLinkSensor(asset.id, sensorCode.trim());
    } catch (error) {
      setLinkError(errorText(error));
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="prediction-dialog" role="dialog" aria-modal="true" aria-labelledby="asset-readings-title">
        <div className="dialog-heading">
          <span className="result-spark"><Activity size={19} /></span>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar lecturas">×</button>
        </div>
        <h2 id="asset-readings-title">{asset.name || asset.code}</h2>
        {canLink && (
          <form className="transformer-form" onSubmit={submitSensor}>
            <h3>Vincular sensor de temperatura</h3>
            <p className="form-help">Copia el código del sensor que muestra el portal de configuración del ESP32. Puedes volver después desde Activos.</p>
            <label className="form-field">
              <span>Código del sensor</span>
              <input value={sensorCode} onChange={(event) => setSensorCode(event.target.value)} maxLength={50} required placeholder="Ej. SN-001-TMP" />
            </label>
            {linkError && <p className="form-error" role="alert">{linkError}</p>}
            <button type="submit" className="button button-primary" disabled={linking || !sensorCode.trim()}>{linking ? 'Vinculando…' : 'Vincular sensor'}</button>
          </form>
        )}
        <div className="asset-reading-list">
          {(asset.sensors || []).map((sensor) => {
            const hardware = asset.assetType === 'HARDWARE';
            const source = sensor.latestReading?.source;
            const reading = hardware && source !== 'HARDWARE' && source !== 'HARDWARE_DEMO' ? null : sensor.latestReading;
            const sourceLabel = reading?.source === 'HARDWARE_DEMO' && sensor.type === 'VIBRATION'
              ? 'Estimación del MPU6050 sin calibrar'
              : readingSourceLabel(reading?.source);
            return (
              <div className="service-line" key={sensor.id}>
                <span>{sensorOptions.find(({ value }) => value === sensor.type)?.label || sensor.type} · {sensor.code}</span>
                <span className="asset-reading-value">
                  {reading ? `${reading.value} ${reading.unit}` : hardware ? 'Esperando la primera lectura del ESP32' : 'Sin lecturas'}
                  {reading && <small>{dateLabel(reading.timestamp)}</small>}
                  {sourceLabel && <small className="reading-source">{sourceLabel}</small>}
                </span>
              </div>
            );
          })}
          {!asset.sensors?.length && <p className="quiet-note">{asset.assetType === 'HARDWARE' ? 'Pendiente de conexión' : 'Este transformador no tiene sensores disponibles.'}</p>}
          {asset.assetType === 'HARDWARE' && asset.sensors?.length > 0
            && !asset.sensors.some((sensor) => sensor.latestReading?.source === 'HARDWARE') && (
              <p className="form-help">Enciende el ESP32. Si el simulador de datos está activo, páusalo en Operaciones → Entrada de telemetría.</p>
            )}
        </div>
      </section>
    </div>
  );
}

function AssetTypeFilter({ value, onChange, label, disabled }) {
  return (
    <div className="asset-tabs" role="group" aria-label={label}>
      <button type="button" aria-pressed={value === 'HARDWARE'} className={value === 'HARDWARE' ? 'active' : ''} disabled={disabled} onClick={() => onChange('HARDWARE')}>
        <Cpu size={16} />Transformadores reales
      </button>
      <button type="button" aria-pressed={value === 'TEST'} className={value === 'TEST' ? 'active' : ''} disabled={disabled} onClick={() => onChange('TEST')}>
        <SlidersHorizontal size={16} />Transformadores simulados
      </button>
    </div>
  );
}

function Overview({ assets, alerts, setPage, loading }) {
  const [assetType, setAssetType] = useState('HARDWARE');
  const groupAssets = assets.filter((asset) => asset.assetType === assetType);
  const activeAlerts = alerts.filter((alert) => alert.assetType === assetType && !alert.acknowledged);
  const focusAssets = [...groupAssets].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)).slice(0, 4);
  const substationCount = new Set(groupAssets.map((asset) => asset.substationId).filter(Boolean)).size;
  const sensorCount = groupAssets.reduce((count, asset) =>
    count + (asset.sensors || []).filter((sensor) => sensor.status === 'ACTIVE').length, 0);
  const statusCounts = [
    { key: 'NORMAL', label: 'Estables' },
    { key: 'WARNING', label: 'En observación' },
    { key: 'CRITICAL', label: 'Críticos' },
    { key: 'FAILED', label: 'Fuera de servicio' },
  ].map((item) => ({ ...item, value: groupAssets.filter((asset) => asset.status === item.key).length }));
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

      <AssetTypeFilter value={assetType} onChange={setAssetType} label="Tipo de transformadores del resumen" />
      <section className="stats-grid" aria-label="Indicadores principales">
        <StatCard icon={Factory} label="Subestaciones" value={substationCount} helper="Con transformadores del grupo" tone="blue" />
        <StatCard icon={Zap} label="Transformadores" value={groupAssets.length} helper="Activos en seguimiento" tone="violet" />
        <StatCard icon={Activity} label="Sensores activos" value={sensorCount} helper="Sensores habilitados" tone="green" />
        <StatCard icon={Bell} label="Alertas pendientes" value={activeAlerts.length} helper="Requieren revisión" tone="orange" />
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
        <AssetTable assets={focusAssets} emptyTitle={assetType === 'HARDWARE' ? 'No hay transformadores reales registrados' : 'No hay transformadores simulados'} />
      </section>
    </div>
  );
}

const sensorOptions = [
  { value: 'TEMPERATURE', label: 'Temperatura' },
  { value: 'VOLTAGE', label: 'Voltaje' },
  { value: 'CURRENT', label: 'Corriente' },
  { value: 'VIBRATION', label: 'Vibración' },
];

const simulationProfiles = {
  residential: { label: 'Residencial · 750 kVA', rating: '750', age: '4', sensors: ['TEMPERATURE', 'CURRENT'] },
  industrial: { label: 'Industrial · 2.000 kVA', rating: '2000', age: '10', sensors: sensorOptions.map(({ value }) => value) },
};

function TransformerFormDialog({ substations, initialType, onClose, onSubmit, onRegistered, submitting }) {
  const [assetType, setAssetType] = useState(initialType === 'TEST' ? 'TEST' : 'HARDWARE');
  const [substationId, setSubstationId] = useState(() => substations.length ? '' : 'new');
  const [substationType, setSubstationType] = useState('URBAN');
  const [substationName, setSubstationName] = useState('');
  const [substationLocation, setSubstationLocation] = useState('');
  const [transformerName, setTransformerName] = useState('');
  const [transformerCode, setTransformerCode] = useState('');
  const [ratingKva, setRatingKva] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [profileId, setProfileId] = useState('residential');
  const [formError, setFormError] = useState('');
  const isNewSubstation = substationId === 'new';
  const simulated = assetType === 'TEST';
  const profile = simulationProfiles[profileId];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const result = await onSubmit({
      substationId: isNewSubstation ? null : substationId,
      substationType: isNewSubstation ? substationType : null,
      substationName: isNewSubstation ? substationName.trim() : null,
      substationLocation: isNewSubstation ? substationLocation.trim() : null,
      transformerName: transformerName.trim(),
      transformerCode: transformerCode.trim() || null,
      assetType,
      ratingKva: simulated ? Number(profile.rating) : ratingKva === '' ? null : Number(ratingKva),
      ageYears: simulated ? Number(profile.age) : ageYears === '' ? null : Number(ageYears),
      sensorTypes: simulated ? profile.sensors : [],
    });
    if (result?.id) onRegistered(result);
    else setFormError(result || 'No se pudo guardar el transformador.');
  };

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <section className="prediction-dialog transformer-dialog" role="dialog" aria-modal="true" aria-labelledby="transformer-form-title">
        <div className="dialog-heading">
          <h2 id="transformer-form-title">Agregar transformador</h2>
          <button type="button" className="icon-button" onClick={onClose} disabled={submitting} aria-label="Cerrar formulario"><X size={17} /></button>
        </div>
        <form className="transformer-form" onSubmit={handleSubmit}>
          <fieldset className="asset-type-options">
            <legend className="visually-hidden">Tipo de transformador</legend>
            <label className={!simulated ? 'selected hardware' : ''}>
              <input type="radio" name="assetType" checked={!simulated} onChange={() => setAssetType('HARDWARE')} />
              <span><strong>Transformador real</strong><small>Vincula el sensor del ESP32 después de registrarlo.</small></span>
            </label>
            <label className={simulated ? 'selected test' : ''}>
              <input type="radio" name="assetType" checked={simulated} onChange={() => setAssetType('TEST')} />
              <span><strong>Transformador simulado</strong><small>Genera lecturas de prueba a partir de un perfil.</small></span>
            </label>
          </fieldset>

          <section className="transformer-section" aria-label="Datos del transformador">
            <label className="form-field">
              <span>Nombre del transformador</span>
              <input value={transformerName} onChange={(event) => setTransformerName(event.target.value)} maxLength={120} required placeholder="Ej. Transformador Norte 2" />
            </label>
            <label className="form-field">
              <span>¿A qué subestación pertenece?</span>
              <select required value={substationId} onChange={(event) => setSubstationId(event.target.value)}>
                <option value="" disabled>Selecciona una subestación</option>
                {substations.map((substation) => <option key={substation.id} value={substation.id}>{substation.name || substation.code}</option>)}
                <option value="new">Crear nueva subestación…</option>
              </select>
            </label>
            {isNewSubstation && (
              <div className="form-grid new-substation-fields">
                <label className="form-field">
                  <span>Nombre de la subestación</span>
                  <input value={substationName} onChange={(event) => setSubstationName(event.target.value)} maxLength={120} required placeholder="Ej. Subestación Norte" />
                </label>
                <label className="form-field">
                  <span>Tipo de subestación</span>
                  <select value={substationType} onChange={(event) => setSubstationType(event.target.value)}>
                    <option value="URBAN">Urbana</option>
                    <option value="INDUSTRIAL">Industrial</option>
                  </select>
                </label>
                <label className="form-field form-field-wide">
                  <span>Ubicación</span>
                  <input value={substationLocation} onChange={(event) => setSubstationLocation(event.target.value)} maxLength={200} required placeholder="Ej. Distrito Norte" />
                </label>
              </div>
            )}
            {simulated && (
              <label className="form-field">
                <span>Perfil de simulación</span>
                <select value={profileId} onChange={(event) => setProfileId(event.target.value)}>
                  {Object.entries(simulationProfiles).map(([id, option]) => <option key={id} value={id}>{option.label}</option>)}
                </select>
                <small className="form-help">{profile.age} años de uso · {sensorOptions.filter(({ value }) => profile.sensors.includes(value)).map(({ label }) => label).join(', ')}</small>
              </label>
            )}
            <details className="transformer-section">
              <summary>Datos técnicos opcionales</summary>
              <div className="form-grid">
                <label className="form-field form-field-wide">
                  <span>Código de inventario</span>
                  <input value={transformerCode} onChange={(event) => setTransformerCode(event.target.value)} maxLength={50} placeholder="GridMind genera uno si lo dejas vacío" />
                </label>
                {!simulated && (
                  <>
                    <label className="form-field">
                      <span>Potencia nominal (kVA)</span>
                      <input type="number" min="0.01" step="any" value={ratingKva} onChange={(event) => setRatingKva(event.target.value)} />
                      <small className="form-help">Consulta la placa del transformador.</small>
                    </label>
                    <label className="form-field">
                      <span>Antigüedad (años)</span>
                      <input type="number" min="0" max="100" step="1" value={ageYears} onChange={(event) => setAgeYears(event.target.value)} />
                      <small className="form-help">Consulta el registro de instalación.</small>
                    </label>
                  </>
                )}
              </div>
            </details>
          </section>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="form-actions">
            <button type="button" className="button button-outline" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="button button-primary" disabled={submitting}>{submitting ? 'Guardando…' : simulated ? 'Guardar transformador' : 'Guardar y continuar'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}


function TransformerNameDialog({ asset, onClose, onSubmit, submitting }) {
  const [name, setName] = useState(asset.name || '');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const result = await onSubmit(name.trim());
    if (result !== true) setError(result || 'No se pudo actualizar el nombre.');
  };

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <section className="prediction-dialog transformer-dialog" role="dialog" aria-modal="true" aria-labelledby="transformer-name-title">
        <div className="dialog-heading">
          <div><span className="eyebrow">INVENTARIO DE RED</span><h2 id="transformer-name-title">Editar nombre</h2></div>
          <button type="button" className="icon-button" onClick={onClose} disabled={submitting} aria-label="Cerrar edición"><X size={17} /></button>
        </div>
        <p className="prediction-disclaimer">Solo modifica el nombre de presentación. El código y la configuración de telemetría no cambian.</p>
        <form className="transformer-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Nombre del transformador</span>
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions">
            <button type="button" className="button button-outline" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="button button-primary" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar nombre'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ArchiveTransformerDialog({ asset, onClose, onConfirm, submitting }) {
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    const result = await onConfirm();
    if (result !== true) setError(result || 'No se pudo archivar el transformador.');
  };

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <section className="prediction-dialog transformer-dialog" role="alertdialog" aria-modal="true" aria-labelledby="archive-transformer-title" aria-describedby="archive-transformer-description">
        <div className="dialog-heading">
          <div><span className="eyebrow">RETIRAR DEL INVENTARIO</span><h2 id="archive-transformer-title">Archivar transformador</h2></div>
          <button type="button" className="icon-button" onClick={onClose} disabled={submitting} aria-label="Cerrar confirmación"><X size={17} /></button>
        </div>
        <p id="archive-transformer-description" className="prediction-disclaimer">
          Se ocultará <strong>{asset.name || asset.code}</strong> del inventario activo. Sus sensores, lecturas e historial se conservarán y podrás restaurarlo después.
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" className="button button-outline" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button type="button" className="button button-danger" onClick={handleConfirm} disabled={submitting}>{submitting ? 'Archivando…' : 'Archivar transformador'}</button>
        </div>
      </section>
    </div>
  );
}

function AssetsPage({
  substations,
  assets,
  archivedAssets,
  archivedLoading,
  archivedError,
  onLoadArchived,
  onSelect,
  onClaudePredict,
  claudeEnabled,
  claudeUnavailableMessage,
  predictingId,
  onCreateTransformer,
  onLinkSensor,
  onRenameTransformer,
  onArchiveTransformer,
  onRestoreTransformer,
  creating,
  actionPendingId,
  canManageAssets,
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [detailAssetId, setDetailAssetId] = useState('');
  const [assetType, setAssetType] = useState('HARDWARE');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [archivingAsset, setArchivingAsset] = useState(null);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const detailAsset = [...assets, ...archivedAssets].find((asset) => asset.id === detailAssetId);
  const isArchiveView = assetType === 'ARCHIVED';
  const typeAssets = isArchiveView ? archivedAssets : assets.filter((asset) => asset.assetType === assetType);
  const filtered = typeAssets.filter((asset) => {
    const matchesQuery = `${asset.name || ''} ${asset.code || ''} ${asset.substationName || ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (isArchiveView || filter === 'ALL' || asset.status === filter);
  });
  const visibleSubstations = substations
    .map((substation) => ({
      ...substation,
      visibleTransformerCount: (substation.transformers || []).filter((transformer) => transformer.assetType === assetType).length,
    }))
    .filter((substation) => !isArchiveView && substation.visibleTransformerCount > 0);
  const categoryCopy = isArchiveView
    ? 'Equipos retirados del inventario operativo. Su historial se conserva y pueden volver a activarse.'
    : assetType === 'HARDWARE'
      ? 'Transformadores conectados a sensores físicos. Sus lecturas llegan desde el hardware y no las genera el simulador.'
      : 'GridMind genera lecturas simuladas para ensayar escenarios sin afectar equipos físicos.';

  useEffect(() => {
    if (canManageAssets) onLoadArchived();
  }, [canManageAssets, onLoadArchived]);

  const handleRename = async (name) => {
    setDialogSubmitting(true);
    const result = await onRenameTransformer(editingAsset.id, name);
    setDialogSubmitting(false);
    if (result === true) setEditingAsset(null);
    return result;
  };

  const handleArchive = async () => {
    setDialogSubmitting(true);
    const result = await onArchiveTransformer(archivingAsset.id);
    setDialogSubmitting(false);
    if (result === true) {
      setArchivingAsset(null);
      onLoadArchived();
    }
    return result;
  };

  const handleRestore = async (asset) => {
    const result = await onRestoreTransformer(asset.id);
    if (result === true) onLoadArchived();
  };

  const [exampleError, setExampleError] = useState('');

  const loadExample = async () => {
    setExampleError('');
    const result = await onCreateTransformer({
      substationType: 'URBAN',
      substationName: 'Subestación de ejemplo',
      substationLocation: 'Entorno de simulación',
      transformerName: 'Transformador residencial de ejemplo',
      assetType: 'TEST',
      ratingKva: 750,
      ageYears: 4,
      sensorTypes: ['TEMPERATURE', 'CURRENT'],
    });
    if (result?.id) selectAssetType('TEST');
    else setExampleError(result || 'No se pudo cargar el ejemplo.');
  };

  const selectAssetType = (type) => {
    setQuery('');
    setFilter('ALL');
    setAssetType(type);
  };

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="INVENTARIO DE RED"
        title="Activos"
        description="Administra los transformadores reales y simulados de tu cuenta."
        action={canManageAssets && <button className="button button-primary" onClick={() => setShowCreateForm(true)}><Plus size={16} />Agregar transformador</button>}
      />
      {canManageAssets && !assets.some((asset) => asset.assetType === 'TEST') && (
        <section className="surface-card">
          <button type="button" className="button button-outline" disabled={creating} onClick={loadExample}>
            <SlidersHorizontal size={16} />Cargar equipos de ejemplo
          </button>
          {exampleError && <p className="form-error" role="alert">{exampleError}</p>}
        </section>
      )}
      <div className={`notice-banner ${claudeEnabled ? '' : 'error-banner'}`}><Sparkles size={17} /><span>{claudeEnabled ? 'Las predicciones de Claude se ejecutan manualmente al pulsar el botón de cada transformador; no se consulta la API en cada lectura.' : claudeUnavailableMessage}</span></div>
      <div className="asset-tabs" role="tablist" aria-label="Tipo de transformadores">
        <button id="hardware-assets-tab" type="button" role="tab" aria-selected={assetType === 'HARDWARE'} aria-controls="asset-inventory-panel" className={assetType === 'HARDWARE' ? 'active' : ''} onClick={() => selectAssetType('HARDWARE')}>
          <Cpu size={16} />Transformadores reales<span>{assets.filter((asset) => asset.assetType === 'HARDWARE').length}</span>
        </button>
        <button id="test-assets-tab" type="button" role="tab" aria-selected={assetType === 'TEST'} aria-controls="asset-inventory-panel" className={assetType === 'TEST' ? 'active' : ''} onClick={() => selectAssetType('TEST')}>
          <SlidersHorizontal size={16} />Transformadores simulados<span>{assets.filter((asset) => asset.assetType === 'TEST').length}</span>
        </button>
        {canManageAssets && <button id="archived-assets-tab" type="button" role="tab" aria-selected={isArchiveView} aria-controls="asset-inventory-panel" className={isArchiveView ? 'active' : ''} onClick={() => selectAssetType('ARCHIVED')}>
          <Archive size={16} />Archivados<span>{archivedAssets.length}</span>
        </button>}
      </div>
      <div className={`asset-category-summary ${isArchiveView ? 'archived' : assetType === 'HARDWARE' ? 'hardware' : 'test'}`}>
        <span className="asset-category-icon">{isArchiveView ? <Archive size={18} /> : assetType === 'HARDWARE' ? <Cpu size={18} /> : <SlidersHorizontal size={18} />}</span>
        <div><strong>{isArchiveView ? 'Inventario archivado' : assetType === 'HARDWARE' ? 'Transformadores reales' : 'Transformadores simulados'}</strong><p>{categoryCopy}</p></div>
        <span className="asset-category-count">{isArchiveView ? archivedAssets.length : typeAssets.length} {typeAssets.length === 1 ? 'transformador' : 'transformadores'}</span>
      </div>
      <section className="surface-card">
        <div className="toolbar">
          <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar activo o subestación" /></label>
          {!isArchiveView && <label className="select-wrap"><span>Estado</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">Todos</option><option value="NORMAL">Normal</option><option value="WARNING">Atención</option><option value="CRITICAL">Crítico</option><option value="FAILED">Fuera de servicio</option></select><ChevronDown size={15} /></label>}
        </div>
        {isArchiveView && archivedError
          ? <p className="form-error" role="alert">{archivedError}</p>
          : isArchiveView && archivedLoading
            ? <p className="form-help" role="status">Cargando transformadores archivados…</p>
            : <div id="asset-inventory-panel" role="tabpanel" aria-labelledby={isArchiveView ? 'archived-assets-tab' : assetType === 'HARDWARE' ? 'hardware-assets-tab' : 'test-assets-tab'}>
              <AssetTable
                assets={filtered}
                onSelect={isArchiveView ? undefined : onSelect}
                onViewDetails={setDetailAssetId}
                onPredict={isArchiveView ? undefined : onClaudePredict}
                claudeEnabled={claudeEnabled}
                claudeUnavailableMessage={claudeUnavailableMessage}
                predictingId={predictingId}
                showAssetType
                manageAssets={canManageAssets}
                archived={isArchiveView}
                onEditName={(asset) => { setEditingAsset(asset); }}
                onArchive={(asset) => { setArchivingAsset(asset); }}
                onRestore={handleRestore}
                actionPendingId={actionPendingId}
                emptyTitle={isArchiveView ? 'No hay transformadores archivados' : assetType === 'HARDWARE' ? 'No hay transformadores reales registrados' : 'No hay transformadores simulados'}
                emptyDetail={isArchiveView ? 'Los equipos que archives aparecerán aquí; podrás restaurarlos sin perder su historial.' : assetType === 'HARDWARE' ? 'Agrega un transformador conectado a sensores físicos.' : 'Agrega un transformador simulado para generar lecturas de prueba.'}
              />
            </div>}
      </section>
      {!isArchiveView && <div className="substation-grid">
        {visibleSubstations.map((substation) => (
          <article className="substation-card" key={substation.id}>
            <div className="substation-top"><span className="substation-symbol"><Factory size={18} /></span><StatusPill value={substation.status} /></div>
            <h3>{substation.name || substation.code}</h3>
            <p>{substation.location || substation.type || 'Subestación eléctrica'}</p>
            <div className="substation-foot"><span><Zap size={14} />{substation.visibleTransformerCount} transformadores</span><span>{substation.code}</span></div>
          </article>
        ))}
      </div>}
      {detailAsset && <AssetReadingsDialog key={detailAsset.id} asset={detailAsset} onClose={() => setDetailAssetId('')} onLinkSensor={canManageAssets ? onLinkSensor : undefined} />}
      {showCreateForm && (
        <TransformerFormDialog substations={substations} initialType={assetType} onClose={() => setShowCreateForm(false)}
          onSubmit={onCreateTransformer} submitting={creating} onRegistered={(asset) => {
            setShowCreateForm(false);
            selectAssetType(asset.assetType);
            if (asset.assetType === 'HARDWARE') setDetailAssetId(asset.id);
          }} />
      )}
      {editingAsset && <TransformerNameDialog asset={editingAsset} onClose={() => setEditingAsset(null)} onSubmit={handleRename} submitting={dialogSubmitting} />}
      {archivingAsset && <ArchiveTransformerDialog asset={archivingAsset} onClose={() => setArchivingAsset(null)} onConfirm={handleArchive} submitting={dialogSubmitting} />}
    </div>
  );
}

const alertQuestions = [
  ['event', '¿Qué pasó?'],
  ['time', '¿Desde cuándo?'],
  ['next', '¿Qué reviso primero?'],
];

const alertSourceLabels = {
  SENSOR_OBSERVER: 'Lectura de sensor',
  MANUAL_FAILURE_SIMULATION: 'Falla de prueba',
  AI_ANALYSIS: 'Análisis automático',
  THRESHOLD_STRATEGY: 'Análisis por umbrales',
  SUPERVISED_MODEL_STRATEGY: 'Modelo supervisado',
  ISOLATION_FOREST_STRATEGY: 'Detección de anomalías',
  WEIGHTED_AGE_STRATEGY: 'Evaluación por antigüedad',
};


const alertReadingText = (reading) =>
  `${reading.sensor} · ${simulationMeasurement(reading.value, reading.unit)} · ${dateLabel(reading.timestamp)} · ${readingSourceLabel(reading.source, true) || 'Origen sin identificar'}`;

function AlertAssistant({ alertId }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const ask = async (label, topic) => {
    if (pending || !label.trim()) return;
    setPending(true);
    setError('');
    try {
      const { data } = await askAlertAssistant(alertId, { topic, question: topic ? undefined : label.trim() });
      setMessages((previous) => [...previous, { ...data, question: label.trim() }]);
      if (!topic) setQuestion('');
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setPending(false);
    }
  };

  const evidence = messages.at(-1);
  const readings = evidence?.readings;
  const triggeringReading = evidence?.triggeringReading;
  return (
    <div className="ai-explanation-actions">
      <button type="button" className="button button-outline compact" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Sparkles size={15} /> {open ? 'Cerrar asistente' : 'Explícame esta alerta'}
      </button>
      {open && <section className="alert-assistant" aria-label="Asistente de alertas">
        <div className="alert-assistant-questions">
          {alertQuestions.map(([topic, label]) => <button key={topic} type="button" className="button button-outline compact" disabled={pending} onClick={() => ask(label, topic)}>{label}</button>)}
        </div>
        <div aria-live="polite" role="log">
          {messages.map((message, index) => <div key={index} className="ai-explanation">
            <Sparkles size={16} />
            <div><strong>{message.question}</strong><p>{message.answer}</p><small>{message.provider}</small></div>
          </div>)}
          {pending && <p className="quiet-note">Consultando la alerta…</p>}
        </div>
        {error && <p className="ai-error" role="alert">{error}</p>}
        {readings && <details className="alert-assistant-evidence">
          <summary>Fuentes de la respuesta</summary>
          {triggeringReading
            ? <p><strong>Lectura que disparó la alerta</strong><br />{alertReadingText(triggeringReading)}</p>
            : <p>El registro de esta alerta no tiene una lectura detonante disponible.</p>}
          {readings.length ? <>
            <p>Otras lecturas guardadas durante los cinco minutos previos</p>
            <ul>{readings.map((reading, index) =>
              <li key={index}>{alertReadingText(reading)}</li>
            )}</ul>
          </> : <p>Sin otras lecturas guardadas en ese intervalo.</p>}
        </details>}
        <form className="alert-assistant-questions" onSubmit={(event) => { event.preventDefault(); ask(question); }}>
          <input className="form-input" aria-label="Pregunta sobre esta alerta" placeholder="Escribe una pregunta sobre esta alerta" value={question} maxLength={500} onChange={(event) => setQuestion(event.target.value)} />
          <button className="button button-primary compact" disabled={pending || !question.trim()}>Preguntar</button>
        </form>
      </section>}
    </div>
  );
}


function AlertsPage({ alerts, onAcknowledge, pendingId, readOnly }) {
  const [filter, setFilter] = useState('OPEN');
  const alertGroups = [
    { type: 'HARDWARE', label: 'Transformadores reales', icon: Cpu, tone: 'hardware' },
    { type: 'TEST', label: 'Transformadores simulados', icon: SlidersHorizontal, tone: 'test' },
  ];
  const visibleAlerts = alerts.filter((alert) => filter === 'ALL' || (filter === 'OPEN' ? !alert.acknowledged : alert.acknowledged));
  return (
    <div className="page-stack">
      <SectionHeading eyebrow="CENTRO DE ATENCIÓN" title="Alertas" description="Identifica el activo, entiende el evento y registra cuándo fue revisado." action={<label className="select-wrap"><span>Mostrar</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="OPEN">Pendientes</option><option value="ALL">Todas</option><option value="DONE">Reconocidas</option></select><ChevronDown size={15} /></label>} />
      {alertGroups.map(({ type, label, icon: Icon, tone }) => {
        const groupAlerts = visibleAlerts.filter((alert) => alert.assetType === type);
        return (
          <section className={`alert-group ${tone}`} key={type} aria-labelledby={`alert-group-${type.toLowerCase()}`}>
            <header className="alert-group-heading">
              <span className="alert-group-icon"><Icon size={16} /></span>
              <div><h3 id={`alert-group-${type.toLowerCase()}`}>{label}</h3><p>{type === 'HARDWARE' ? 'Eventos de transformadores con sensores físicos.' : 'Eventos generados por los transformadores simulados.'}</p></div>
              <span className="alert-group-count">{groupAlerts.length}</span>
            </header>
            <div className="alert-page-list">
        {groupAlerts.map((alert) => (
          <article className={`alert-card ${alert.acknowledged ? 'acknowledged' : ''}`} key={alert.id}>
            <span className={`alert-mark large ${statusClasses[alert.severity] || 'warning'}`}><AlertTriangle size={19} /></span>
            <div className="alert-main">
              <div className="alert-title-row"><h3>{alert.transformerCode || alert.transformerName || 'Evento de la red'}</h3><StatusPill value={alert.severity} /></div>
              <p>{alert.message || 'Se detectó un cambio en el estado del activo.'}</p>
              <div className="alert-meta"><span><Factory size={14} />{alert.substationName || 'Subestación sin identificar'}</span><span><Clock3 size={14} />{dateLabel(alert.createdAt)}</span>{alert.acknowledged && <span><CheckCircle2 size={14} />Revisada por {alert.acknowledgedBy || 'operador'}</span>}</div>
              <div className="alert-meta">
                <span>Origen: {readingSourceLabel(alert.readingSource, true) || alertSourceLabels[alert.source] || 'Evento registrado'}</span>
                {alert.readingTimestamp && <span>Lectura: {dateLabel(alert.readingTimestamp)}</span>}
              </div>
              <AlertAssistant alertId={alert.id} />
            </div>
            {!alert.acknowledged && !readOnly && <button className="button button-outline" onClick={() => onAcknowledge(alert.id)} disabled={pendingId === alert.id}>{pendingId === alert.id ? <Loader2 className="spin" size={16} /> : <Check size={16} />} Marcar revisada</button>}
          </article>
        ))}
        {!groupAlerts.length && <div className="surface-card"><EmptyState icon={ShieldCheck} title={filter === 'OPEN' ? `Sin alertas pendientes de ${label.toLowerCase()}` : `No hay alertas de ${label.toLowerCase()}`} detail={type === 'HARDWARE' ? 'Las alertas de equipos con sensores físicos aparecerán aquí.' : 'Las alertas de los transformadores simulados aparecerán aquí.'} /></div>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const simulationVariables = {
  TEMPERATURE: { label: 'Temperatura', unit: '°C', minimum: -273.15, sliderMin: 0, sliderMax: 150, initial: 90 },
  VIBRATION: { label: 'Vibración', unit: 'mm/s', minimum: 0, sliderMin: 0, sliderMax: 15, initial: 5 },
  CURRENT: { label: 'Corriente', unit: 'A', minimum: 0, sliderMin: 0, sliderMax: 1000, initial: 500 },
  VOLTAGE: { label: 'Voltaje', unit: 'kV', minimum: 0, sliderMin: 0, sliderMax: 30, initial: 15 },
};


function simulationChange(entry) {
  if (!Number.isFinite(entry.simulatedValue)) {
    return Number.isFinite(entry.deltaPercent)
      ? `${entry.deltaPercent > 0 ? '+' : ''}${simulationNumber.format(entry.deltaPercent)} %`
      : '—';
  }

  const unit = simulationVariables[entry.variableModified]?.unit || '';
  const target = simulationMeasurement(entry.simulatedValue, unit);
  return Number.isFinite(entry.originalValue)
    ? `${simulationMeasurement(entry.originalValue, unit)} → ${target}`
    : target;
}

function SimulatorPage({ assets, history, onRefresh, selectedAssetId, onError }) {
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId);
  const [group, setGroup] = useState(null);
  const [chosenTransformerId, setChosenTransformerId] = useState('');
  const assetType = group ?? selectedAsset?.assetType ?? 'HARDWARE';
  const groupAssets = assets.filter((asset) => asset.assetType === assetType);
  const preferredTransformerId = chosenTransformerId || selectedAssetId;
  const transformerId = groupAssets.find((asset) => asset.id === preferredTransformerId)?.id
    ?? groupAssets[0]?.id ?? '';
  const groupHistory = history.filter((entry) => entry.assetType === assetType);
  const [variableModified, setVariableModified] = useState('TEMPERATURE');
  const [targetValue, setTargetValue] = useState(String(simulationVariables.TEMPERATURE.initial));
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const variable = simulationVariables[variableModified];
  const target = targetValue === '' ? NaN : Number(targetValue);
  const validTarget = Number.isFinite(target) && target >= variable.minimum;
  const sliderValue = validTarget
    ? Math.min(variable.sliderMax, Math.max(variable.sliderMin, target))
    : variable.initial;

  const changeVariable = (event) => {
    const nextVariable = event.target.value;
    setVariableModified(nextVariable);
    setTargetValue(String(simulationVariables[nextVariable].initial));
    setResult(null);
  };

  const changeGroup = (nextGroup) => {
    setGroup(nextGroup);
    setChosenTransformerId('');
    setResult(null);
  };

  const simulate = async (event) => {
    event.preventDefault();
    if (!validTarget || !transformerId || running) return;

    setRunning(true);
    setResult(null);
    try {
      const response = await runSimulation({ transformerId, variableModified, targetValue: target });
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
      <AssetTypeFilter value={assetType} onChange={changeGroup} label="Tipo de transformadores del simulador" disabled={running} />
      <div className="simulation-layout">
        <form className="surface-card simulation-form" onSubmit={simulate}>
          <div className="card-heading"><div><span className="eyebrow">CONFIGURA UNA PRUEBA</span><h3>Escenario hipotético</h3></div><span className="form-icon"><SlidersHorizontal size={18} /></span></div>
          <label className="field-label">Transformador
            <select required value={transformerId} onChange={(event) => { setChosenTransformerId(event.target.value); setResult(null); }} disabled={running || !groupAssets.length}>
              {groupAssets.length ? groupAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.code} · {asset.name}</option>) : <option value="">Sin transformadores en este grupo</option>}
            </select>
          </label>
          <label className="field-label">Variable que quieres modificar
            <select value={variableModified} onChange={changeVariable} disabled={running}>
              {Object.entries(simulationVariables).map(([key, config]) => (
                <option key={key} value={key}>{config.label} ({config.unit})</option>
              ))}
            </select>
          </label>
          <label className="field-label">{variable.label} objetivo ({variable.unit})
            <input type="number" step="any" min={variable.minimum} required value={targetValue} disabled={running}
              onChange={(event) => setTargetValue(event.target.value)} />
          </label>
          <input className="range-input" type="range" aria-label={`Ajustar valor objetivo en ${variable.unit}`}
            min={variable.sliderMin} max={variable.sliderMax} step="0.1" value={sliderValue} disabled={running}
            onChange={(event) => setTargetValue(event.target.value)} />
          <div className="range-ends"><small>{variable.sliderMin} {variable.unit}</small><small>{variable.sliderMax} {variable.unit}</small></div>
          <button type="submit" className="button button-primary button-wide" disabled={running || !transformerId || !validTarget}>{running ? <Loader2 className="spin" size={17} /> : <Play size={16} fill="currentColor" />} {running ? 'Evaluando escenario…' : 'Ejecutar simulación'}</button>
          <p className="privacy-note"><ShieldCheck size={15} />La simulación no cambia la base de datos operativa.</p>
        </form>

        <section className="surface-card result-panel">
          {result ? (
            <>
              <div className="card-heading"><div><span className="eyebrow">RESULTADO DEL MODELO</span><h3>{result.transformerName || result.transformerCode}</h3></div><span className="result-spark"><Sparkles size={19} /></span></div>
              <p className="result-description">
                <strong>{simulationVariables[result.variableModified]?.label || result.variableModified}</strong>
              </p>
              <div className="comparison-grid">
                <div>
                  <span>Lectura original</span>
                  <strong>{simulationMeasurement(result.originalValue, simulationVariables[result.variableModified]?.unit)}</strong>
                  <StatusPill value={result.originalState} />
                  <span className="simulation-probability">Estimación registrada <b>{probabilityLabel(result.originalProbability)}</b></span>
                </div>
                <ArrowUpRight className="comparison-arrow" size={19} />
                <div>
                  <span>Valor simulado</span>
                  <strong>{simulationMeasurement(result.simulatedValue, simulationVariables[result.variableModified]?.unit)}</strong>
                  <StatusPill value={result.simulatedState} />
                  <span className="simulation-probability">Probabilidad estimada de falla <b>{probabilityLabel(result.simulatedProbability)}</b></span>
                </div>
              </div>
              {(result.warningAlertThreshold != null || result.criticalAlertThreshold != null) && (
                <div className="notice-banner">
                  <AlertTriangle size={17} />
                  <span><strong>Umbrales de alerta de GridMind</strong><br />
                    {result.warningAlertThreshold != null && `Atención si supera ${simulationMeasurement(result.warningAlertThreshold, simulationVariables[result.variableModified]?.unit)}. `}
                    {result.criticalAlertThreshold != null && `Crítica si supera ${simulationMeasurement(result.criticalAlertThreshold, simulationVariables[result.variableModified]?.unit)}. `}
                    Estos umbrales se aplican al recibir lecturas de sensores.
                  </span>
                </div>
              )}
              {result.referenceInputs?.length > 0 && <p className="quiet-note">
                El escenario usó valores de referencia para {result.referenceInputs.map((type) => simulationVariables[type]?.label || 'una variable').join(', ')} porque faltaban lecturas.
              </p>}
              <p className="quiet-note">Resultado hipotético. El porcentaje depende del método de análisis y de los valores usados para el escenario. Para un equipo real, contrasta el resultado con las lecturas y los límites del equipo.</p>
              <div className="recommendation-box"><Sparkles size={17} /><p><strong>Recomendación del modelo</strong><br />{result.recommendation || 'Revisa las condiciones del activo y repite el análisis con datos actualizados.'}</p></div>
            </>
          ) : (
            <EmptyState icon={Gauge} title="El resultado aparecerá aquí" detail="Elige un transformador, ajusta una variable y ejecuta la simulación para comparar el riesgo." />
          )}
        </section>
      </div>
      <section className="surface-card">
        <div className="card-heading"><div><span className="eyebrow">ACTIVIDAD RECIENTE</span><h3>Simulaciones anteriores</h3></div></div>
        {groupHistory.length ? <div className="table-scroll"><table className="asset-table"><thead><tr><th>Activo</th><th>Variable</th><th>Escenario</th><th>Estado simulado</th><th>Ejecutada</th></tr></thead><tbody>{groupHistory.slice(0, 8).map((entry) => <tr key={entry.simulationId}><td><strong>{entry.transformerCode || entry.transformerName}</strong></td><td>{simulationVariables[entry.variableModified]?.label || entry.variableModified}</td><td>{simulationChange(entry)}</td><td><StatusPill value={entry.simulatedState} /></td><td>{dateLabel(entry.executedAt)}</td></tr>)}</tbody></table></div> : <p className="quiet-note">Aún no hay simulaciones guardadas para este grupo.</p>}
      </section>
    </div>
  );
}

const riskStrategies = {
  SUPERVISED_MODEL_STRATEGY: {
    label: 'Modelo supervisado (Random Forest)',
    detail: 'Combina lecturas y antigüedad para estimar el riesgo. Úsalo para obtener una evaluación general con el modelo entrenado en casos sintéticos.',
  },
  THRESHOLD_STRATEGY: {
    label: 'Reglas por umbral',
    detail: 'Suma riesgo cuando se superan límites definidos de temperatura, corriente o vibración. Úsalo si quieres entender qué condición hizo subir el riesgo.',
  },
  ISOLATION_FOREST_STRATEGY: {
    label: 'Detección de anomalías (Isolation Forest)',
    detail: 'Busca combinaciones de lecturas poco habituales. Úsalo para detectar comportamientos que se apartan del patrón esperado.',
  },
  WEIGHTED_AGE_STRATEGY: {
    label: 'Riesgo por antigüedad',
    detail: 'Parte de los años de servicio y añade peso si la temperatura o la vibración aumentan. Úsalo cuando el desgaste del equipo sea una prioridad.',
  },
};

function ManualTelemetryScenario({ assets, configuration, onSave, onClear, onViewAlerts }) {
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const active = configuration?.manualScenario;
  const eligible = assets.filter((asset) => asset.assetType === 'TEST'
    && asset.sensors?.some((sensor) => sensor.status === 'ACTIVE'));
  const chosen = draft?.transformerId ?? active?.transformerId;
  const selected = eligible.find((asset) => asset.id === chosen) ?? eligible[0];
  const sensors = sensorOptions.flatMap(({ value, label }) => {
    const sensor = selected?.sensors.find((item) => item.type === value && item.status === 'ACTIVE');
    return sensor ? [{ type: value, label, unit: sensor.unit }] : [];
  });
  const values = draft && draft.transformerId === selected?.id
    ? draft.values : active?.transformerId === selected?.id ? active?.values ?? {} : {};
  const configuredAsset = eligible.find((asset) => asset.id === active?.transformerId);
  const populated = sensors.filter(({ type }) => values[type] != null && values[type] !== '');

  const apply = async (event) => {
    event.preventDefault();
    if (!selected || !populated.length || busy) return;
    setBusy(true);
    try {
      const fixedValues = Object.fromEntries(populated.map(({ type }) => [type, Number(values[type])]));
      if (await onSave(selected.id, fixedValues)) setDraft(null);
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setBusy(true);
    try {
      if (await onClear()) setDraft(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="surface-card" aria-labelledby="manual-telemetry-title">
      <div className="card-heading">
        <div>
          <h3 id="manual-telemetry-title">Probar fallas con lecturas simuladas</h3>
          <p className="analysis-copy">Fija lecturas de un equipo de prueba. GridMind las analiza y muestra las alertas que correspondan.</p>
        </div>
        {active && <button type="button" className="button button-outline compact" onClick={onViewAlerts}><Bell size={15} />Ver alertas</button>}
      </div>
      {active && (
        <div className="analysis-current" role="status">Escenario activo
          <strong>{configuredAsset?.name || 'Equipo simulado'}</strong>
          {Object.entries(active.values).map(([type, value]) => {
            const label = sensorOptions.find((option) => option.value === type)?.label || type;
            const unit = configuredAsset?.sensors.find((sensor) => sensor.type === type)?.unit || '';
            return <span key={type}>{label} {simulationMeasurement(value, unit)}</span>;
          })}
        </div>
      )}
      {selected ? (
        <form onSubmit={apply} className="strategy-guide">
          <label className="form-field">
            <span>Transformador simulado</span>
            <select value={selected.id} onChange={(event) => setDraft({ transformerId: event.target.value, values: {} })} disabled={busy}>
              {eligible.map((asset) => <option value={asset.id} key={asset.id}>{asset.code} · {asset.name}</option>)}
            </select>
          </label>
          <div className="form-grid">
            {sensors.map(({ type, label, unit }) => (
              <label className="form-field" key={type}>
                <span>{label} ({unit})</span>
                <input type="number" step="any" min={type === 'TEMPERATURE' ? '-273.15' : '0'} max="1000000"
                  value={values[type] ?? ''} placeholder="Lectura normal"
                  onChange={(event) => setDraft({ transformerId: selected.id, values: { ...values, [type]: event.target.value } })}
                  disabled={busy} />
              </label>
            ))}
          </div>
          <p className="analysis-copy">Los campos vacíos siguen generando lecturas normales para este equipo.</p>
          <div className="strategy-actions">
            {sensors.some(({ type }) => type === 'TEMPERATURE') && (
              <button type="button" className="button button-outline" disabled={busy}
                onClick={() => setDraft({ transformerId: selected.id, values: { TEMPERATURE: 100 } })}>
                Cargar ejemplo de sobrecalentamiento
              </button>
            )}
            <button type="submit" className="button button-primary" disabled={busy || !populated.length}>Aplicar escenario manual</button>
          </div>
        </form>
      ) : <p className="quiet-note">Agrega un transformador simulado con sensores activos en Activos.</p>}
      {active && (
        <div className="strategy-guide">
          <button type="button" className="button button-outline" onClick={clear} disabled={busy}>
            {configuration.active && configuration.scenario === 'NORMAL' ? 'Volver a lecturas normales' : 'Quitar escenario manual'}
          </button>
          <p className="analysis-copy">{configuration.active
            ? 'El equipo vuelve al escenario general. Las alertas generadas siguen en el historial.'
            : 'Se detienen las lecturas manuales. El simulador general sigue pausado.'}</p>
        </div>
      )}
    </section>
  );
}

function OperationsPage({ maintenances, assets, alerts, health, telemetryStatus, simulatorConfig, onComplete, onCommand, onUndoCommand, pendingId, onStrategyChange, onSimulatorChange, onManualTelemetry, onClearManualTelemetry, onViewAlerts, canConfigure, readOnly }) {
  const [draft, setDraft] = useState(null);
  const [savingStrategy, setSavingStrategy] = useState(false);
  const configuredStrategy = health?.configuredStrategy || health?.activeStrategy;
  const savedStrategy = Object.hasOwn(riskStrategies, configuredStrategy) ? configuredStrategy : 'SUPERVISED_MODEL_STRATEGY';
  const savedDegraded = Boolean(health?.degradedMode);
  const strategy = draft?.strategy ?? savedStrategy;
  const degraded = draft?.degraded ?? savedDegraded;
  const activeStrategy = savedDegraded ? riskStrategies.THRESHOLD_STRATEGY.label : riskStrategies[savedStrategy].label;
  const hasUnsavedChanges = strategy !== savedStrategy || degraded !== savedDegraded;
  const [scenario, setScenario] = useState(simulatorConfig?.scenario || 'NORMAL');
  const simulatorActive = Boolean(telemetryStatus?.simulatorActive);

  async function saveStrategy() {
    setSavingStrategy(true);
    try {
      if (await onStrategyChange(strategy, degraded)) setDraft(null);
    } finally {
      setSavingStrategy(false);
    }
  }

  useEffect(() => {
    setScenario(simulatorConfig?.scenario || 'NORMAL');
  }, [simulatorConfig]);

  return (
    <div className="page-stack">
      <SectionHeading eyebrow="HERRAMIENTAS DE OPERACIÓN" title="Operaciones" description="Gestiona recomendaciones de mantenimiento y revisa el estado de los servicios." />
      <section className="surface-card">
        <div className="card-heading"><div><span className="eyebrow">PLAN DE TRABAJO</span><h3>Mantenimiento programado y recomendado</h3></div><span className="count-chip">{maintenances.filter((item) => item.status !== 'COMPLETED').length} pendientes</span></div>
        <div className="maintenance-list">
          {maintenances.map((item) => (
            <article className="maintenance-row" key={item.id}>
              <span className={`maintenance-icon ${item.status === 'COMPLETED' ? 'done' : ''}`}>{item.status === 'COMPLETED' ? <Check size={17} /> : <Wrench size={17} />}</span>
              <div className="maintenance-copy"><strong>{item.transformerCode || item.transformerName || 'Activo'}</strong><p>{item.recommendation || 'Revisión preventiva recomendada.'}</p><small>{displayStatus(item.status)} · {dateLabel(item.scheduledDate || item.createdAt)}</small></div>
              {item.status !== 'COMPLETED' && !readOnly && <button className="button button-outline compact" disabled={pendingId === item.id} onClick={() => onComplete(item.id)}>{pendingId === item.id ? <Loader2 className="spin" size={15} /> : <Check size={15} />} Completar</button>}
            </article>
          ))}
          {!maintenances.length && <EmptyState icon={Wrench} title="Sin recomendaciones pendientes" detail="Las recomendaciones generadas para los activos se mostrarán aquí." />}
        </div>
      </section>

      {canConfigure && (
        <ManualTelemetryScenario assets={assets} configuration={simulatorConfig}
          onSave={onManualTelemetry} onClear={onClearManualTelemetry} onViewAlerts={onViewAlerts} />
      )}
      <div className="operations-grid">
        <article className="surface-card">
          <div className="card-heading"><div><span className="eyebrow">SISTEMA DE ANÁLISIS</span><h3>Configuración de IA</h3></div><span className="form-icon"><Cpu size={18} /></span></div>
          <p className="analysis-copy">Elige cómo se calcula el riesgo en el monitoreo y en el Simulador de tu cuenta.</p>
          <div className="analysis-current">En uso <strong>{activeStrategy}</strong>{savedDegraded && <span>Modo de respaldo activo</span>}</div>
          <label className="field-label strategy-field">Método de análisis
            <select value={strategy} aria-describedby="strategy-description"
              onChange={(event) => setDraft({ strategy: event.target.value, degraded })} disabled={!canConfigure || savingStrategy}>
              {Object.entries(riskStrategies).map(([value, method]) => (
                <option value={value} key={value}>{method.label}</option>
              ))}
            </select>
          </label>
          <p id="strategy-description" className="analysis-copy" aria-live="polite">{riskStrategies[strategy].detail}</p>
          <details className="strategy-guide">
            <summary>Comparar los métodos de análisis</summary>
            <dl>{Object.entries(riskStrategies).map(([value, method]) => (
              <div key={value}><dt>{method.label}</dt><dd>{method.detail}</dd></div>
            ))}</dl>
          </details>
          <label className="toggle-row strategy-toggle">
            <span><strong>Forzar reglas de respaldo</strong><small>Actívalo para usar reglas por umbral temporalmente y probar el modo de respaldo. Al desactivarlo y guardar, se vuelve al método elegido.</small></span>
            <input type="checkbox" checked={degraded} onChange={(event) => setDraft({ strategy, degraded: event.target.checked })} disabled={!canConfigure || savingStrategy} />
          </label>
          {canConfigure && (
            <div className="strategy-actions">
              <button type="button" className="button button-primary" onClick={saveStrategy} disabled={!hasUnsavedChanges || savingStrategy}>
                {savingStrategy ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
                {savingStrategy ? 'Guardando…' : 'Guardar configuración'}
              </button>
              {hasUnsavedChanges && !savingStrategy && <span className="analysis-copy" role="status">Cambios sin guardar</span>}
            </div>
          )}
        </article>
        <article className="surface-card system-card">
          <div className="card-heading"><div><span className="eyebrow">SERVICIOS</span><h3>Estado de conexión</h3></div><Activity size={19} className="green-icon" /></div>
          <div className="service-line"><span>API GridMind</span><span className="service-state"><i />{health?.status === 'UP' ? 'En línea' : 'Sin conexión'}</span></div>
          <div className="service-line"><span>Base de datos</span><span className="service-state"><i />{health?.database === 'PostgreSQL Connected' ? 'PostgreSQL conectado' : health?.database ? 'Sin conexión' : 'Esperando conexión'}</span></div>
          <div className="service-line"><span>Actualización de datos</span><span className="service-state"><i />Cada 5 segundos</span></div>
          <div className="system-foot"><span>Java 25</span><span>{activeStrategy}</span></div>
        </article>
      </div>
      <section className="surface-card">
        <div className="card-heading"><div><span className="eyebrow">MAQUETA FÍSICA</span><h3>Entrada de telemetría</h3></div><span className="count-chip">{telemetryStatus?.hardwareIngestionEnabled ? 'Receptor configurado' : 'Receptor pendiente'}</span></div>
        <div className="service-line"><span>Simulador de datos</span><span className="service-state"><i />{simulatorActive ? 'Activo' : 'Pausado'}</span></div>
        <div className="service-line"><span>Última lectura de hardware</span><span>{telemetryStatus?.lastHardwareReadingAt ? dateLabel(telemetryStatus.lastHardwareReadingAt) : 'Sin lecturas de hardware'}</span></div>
        {canConfigure && <label className="field-label">Escenario del simulador
          <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
            <option value="NORMAL">Normal</option>
            <option value="GRADUAL_DEGRADATION">Degradación gradual</option>
            <option value="SUDDEN_FAILURE">Falla súbita</option>
          </select>
        </label>}
        {canConfigure && <button className="button button-primary" disabled={!telemetryStatus || pendingId === 'simulator'} onClick={() => onSimulatorChange(simulatorActive, scenario)}>{pendingId === 'simulator' ? 'Actualizando…' : 'Aplicar escenario general'}</button>}
        {canConfigure && <button className="button button-outline" disabled={!telemetryStatus || pendingId === 'simulator'} onClick={() => onSimulatorChange(!simulatorActive, scenario)}>{pendingId === 'simulator' ? 'Actualizando…' : simulatorActive ? 'Pausar simulador' : 'Reanudar simulador'}</button>}
        {!telemetryStatus?.hardwareIngestionEnabled && <p className="quiet-note">El receptor ESP32 se habilita al configurar TELEMETRY_DEVICE_TOKEN en el backend y reiniciarlo.</p>}
        {!simulatorActive && <p className="quiet-note">El simulador general está pausado. Puedes probar un escenario manual en un equipo simulado.</p>}
        <p className="quiet-note">{telemetryStatus?.modelValidationNotice || 'La predicción experimental aún debe validarse con mediciones etiquetadas de la maqueta.'}</p>
      </section>
      <section className="surface-card">
        <div className="card-heading">
          <div><span className="eyebrow">PATRÓN COMMAND + MEMENTO</span><h3>Comandos de operación</h3></div>
          <button className="button button-outline compact" disabled={pendingId === 'command-undo'} onClick={onUndoCommand}>
            {pendingId === 'command-undo' ? <Loader2 className="spin" size={15} /> : <RefreshCw size={15} />} Deshacer último
          </button>
        </div>
        <div className="maintenance-list">
          {assets.map((asset) => (
            <article className="maintenance-row" key={`command-${asset.id}`}>
              <span className="maintenance-icon"><Zap size={17} /></span>
              <div className="maintenance-copy"><strong>{asset.code || asset.name}</strong><p>{asset.substationName || 'Activo de la red'}</p></div>
              {asset.assetType === 'TEST' && <button className="button button-outline compact" disabled={pendingId === `SIMULATE_FAILURE-${asset.id}`} onClick={() => onCommand('SIMULATE_FAILURE', asset.id)}>
                {pendingId === `SIMULATE_FAILURE-${asset.id}` ? <Loader2 className="spin" size={15} /> : <AlertTriangle size={15} />} Simular falla
              </button>}
              <button className="button button-outline compact" disabled={pendingId === `SCHEDULE_MAINTENANCE-${asset.id}`} onClick={() => onCommand('SCHEDULE_MAINTENANCE', asset.id)}>
                {pendingId === `SCHEDULE_MAINTENANCE-${asset.id}` ? <Loader2 className="spin" size={15} /> : <Wrench size={15} />} Programar mantenimiento
              </button>
            </article>
          ))}
          {alerts.filter((alert) => !alert.acknowledged).slice(0, 5).map((alert) => (
            <article className="maintenance-row" key={`command-${alert.id}`}>
              <span className="maintenance-icon"><Bell size={17} /></span>
              <div className="maintenance-copy"><strong>{alert.transformerCode || alert.transformerName || 'Alerta'}</strong><p>{alert.message}</p></div>
              <button className="button button-outline compact" disabled={pendingId === `ACKNOWLEDGE_ALERT-${alert.id}`} onClick={() => onCommand('ACKNOWLEDGE_ALERT', alert.id)}>
                {pendingId === `ACKNOWLEDGE_ALERT-${alert.id}` ? <Loader2 className="spin" size={15} /> : <Check size={15} />} Reconocer alerta
              </button>
            </article>
          ))}
          {!assets.length && !alerts.some((alert) => !alert.acknowledged) && <p className="quiet-note">No hay activos ni alertas pendientes para ejecutar comandos.</p>}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authConnectionError, setAuthConnectionError] = useState('');
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

  const handleSessionExpired = useCallback(() => {
    setCurrentUser(null);
    setAuthConnectionError('Tu sesión expiró o ya no es válida. Inicia sesión de nuevo para continuar.');
  }, []);

  if (authLoading) {
    return <main className="auth-page"><div className="auth-loading"><span className="brand-mark"><Zap size={20} /></span><p>Conectando con GridMind…</p></div></main>;
  }

  if (!currentUser) {
    return <AuthPage onAuthenticated={(user) => {
      setCurrentUser(user);
      setAuthConnectionError('');
    }} connectionError={authConnectionError} />;
  }

  return <WorkspaceApp key={currentUser.id} currentUser={currentUser}
    onSessionExpired={handleSessionExpired} onLogout={() => setCurrentUser(null)} />;
}


function WorkspaceApp({ currentUser, onSessionExpired, onLogout }) {
  const workspaceActive = useRef(false);
  const [page, setPage] = useState('overview');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [substations, setSubstations] = useState([]);
  const [archivedAssets, setArchivedAssets] = useState([]);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [archivedError, setArchivedError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [health, setHealth] = useState(null);
  const [telemetryStatus, setTelemetryStatus] = useState(null);
  const [simulatorConfiguration, setSimulatorConfiguration] = useState(null);
  const [claudeStatus, setClaudeStatus] = useState({ enabled: false, provider: 'Anthropic Claude', model: 'claude-sonnet-4-5', remainingRequests: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [claudePrediction, setClaudePrediction] = useState(null);
  const [claudePredictionError, setClaudePredictionError] = useState('');
  const [predictingAssetId, setPredictingAssetId] = useState('');

  const assets = useMemo(() => substations.flatMap((substation) => (substation.transformers || []).map((asset) => ({
    ...asset,
    substationName: asset.substationName || substation.name,
  }))), [substations]);
  const currentPage = navigation.find((item) => item.id === page) || navigation[0];

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    const results = await Promise.allSettled([
      getHealth(),
      getGridHierarchy(),
      getAlerts(),
      getMaintenances(),
      getSimulationHistory(),
      getClaudeStatus(),
      getTelemetryStatus(),
      getSimulatorConfig(),
    ]);
    if (!workspaceActive.current) return;
    const [healthResult, gridResult, alertsResult, maintenanceResult, simulationResult, claudeResult, telemetryResult, simulatorResult] = results;
    const read = (result) => (result.status === 'fulfilled' ? result.value.data : null);
    const sessionExpired = results.some((result) =>
      result.status === 'rejected' && result.reason?.response?.status === 401
    );

    if (sessionExpired) {
      onSessionExpired();
      return;
    }

    setHealth(read(healthResult));
    setSubstations(read(gridResult) || []);
    setAlerts(read(alertsResult) || []);
    setMaintenances(read(maintenanceResult) || []);
    setSimulations(read(simulationResult) || []);
    if (claudeResult.status === 'fulfilled') {
      setClaudeStatus(claudeResult.value.data);
    }
    if (telemetryResult.status === 'fulfilled') {
      setTelemetryStatus(telemetryResult.value.data);
    }
    if (simulatorResult.status === 'fulfilled') {
      setSimulatorConfiguration(simulatorResult.value.data);
    }
    setUpdatedAt(new Date());

    const failures = results.filter((result) => result.status === 'rejected');
    const apiIsUp = healthResult.status === 'fulfilled' && healthResult.value.data?.status === 'UP';
    if (!apiIsUp) {
      setConnectionError('No se pudo conectar con el backend. Inicia Docker Compose y verifica que PostgreSQL esté saludable.');
    } else if (failures.length) {
      const firstFailure = failures[0];
      setConnectionError(`El backend responde, pero ${failures.length} solicitud(es) de datos fallaron: ${errorText(firstFailure.reason)}`);
      console.error('Could not load GridMind data:', failures.map((failure) => failure.reason));
    } else {
      setConnectionError('');
    }
    setLoading(false);
    setRefreshing(false);
  }, [onSessionExpired]);

  const handleLoadArchived = useCallback(async () => {
    setArchivedLoading(true);
    setArchivedError('');
    try {
      const response = await getArchivedTransformers();
      setArchivedAssets(response.data);
      return true;
    } catch (error) {
      setArchivedError(errorText(error));
      console.error('Could not load archived transformers:', error);
      return false;
    } finally {
      setArchivedLoading(false);
    }
  }, []);

  useEffect(() => {
    workspaceActive.current = true;
    refreshData();
    const timer = window.setInterval(refreshData, 5000);
    return () => {
      workspaceActive.current = false;
      window.clearInterval(timer);
    };
  }, [refreshData]);

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      setActionError(errorText(error));
    }
  };

  const runAction = async (action, successMessage) => {
    setActionError('');
    setNotice('');
    try {
      const response = await action();
      setNotice(typeof successMessage === 'function' ? successMessage(response) : successMessage);
      await refreshData();
      return true;
    } catch (error) {
      setActionError(errorText(error));
      console.error('Could not complete the GridMind action:', error);
      return false;
    }
  };

  const handleAcknowledge = async (id) => {
    setPendingId(id);
    await runAction(() => acknowledgeAlert(id), 'Alerta marcada como revisada.');
    setPendingId('');
  };

  const handleCommand = async (commandName, targetId) => {
    const actionId = `${commandName}-${targetId}`;
    setPendingId(actionId);
    const simulatingFailure = commandName === 'SIMULATE_FAILURE';
    const successMessage = {
      SIMULATE_FAILURE: 'Falla simulada. Revisa la alerta crítica en Transformadores simulados.',
      SCHEDULE_MAINTENANCE: (response) => {
        const maintenance = response?.data?.maintenance;
        return maintenance
          ? `Mantenimiento de ${maintenance.transformerCode} programado para ${dateLabel(maintenance.scheduledDate)}.`
          : 'Mantenimiento programado. Puedes revisarlo en la lista de abajo.';
      },
      ACKNOWLEDGE_ALERT: 'Alerta marcada como revisada.',
    }[commandName] || 'Operación completada.';
    const completed = await runAction(
      () => executeCommand(commandName, targetId),
      successMessage
    );
    setPendingId('');
    if (simulatingFailure || commandName === 'SCHEDULE_MAINTENANCE') {
      if (simulatingFailure && completed) setPage('alerts');
      window.scrollTo(0, 0);
    }
  };

  const handleUndoCommand = async () => {
    setPendingId('command-undo');
    await runAction(() => undoCommand(), 'Último comando deshecho correctamente.');
    setPendingId('');
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

  const handleCreateTransformer = async (request) => {
    setPendingId('create-transformer');
    setNotice('');
    try {
      const { data } = await createTransformer(request);
      await refreshData();
      setNotice('Transformador agregado correctamente.');
      return data;
    } catch (error) {
      console.error('Could not register the transformer:', error);
      return errorText(error);
    } finally {
      setPendingId('');
    }
  };

  const handleRenameTransformer = async (id, name) => {
    setPendingId(`rename-${id}`);
    setNotice('');
    try {
      await updateTransformerName(id, name);
      await refreshData();
      setNotice('Nombre del transformador actualizado.');
      return true;
    } catch (error) {
      console.error('Could not rename the transformer:', error);
      return errorText(error);
    } finally {
      setPendingId('');
    }
  };

  const handleArchiveTransformer = async (id) => {
    setPendingId(`archive-${id}`);
    setNotice('');
    try {
      await archiveTransformer(id);
      await refreshData();
      setNotice('Transformador archivado; sus lecturas e historial se conservaron.');
      return true;
    } catch (error) {
      console.error('Could not archive the transformer:', error);
      return errorText(error);
    } finally {
      setPendingId('');
    }
  };

  const handleRestoreTransformer = async (id) => {
    setPendingId(`restore-${id}`);
    setNotice('');
    try {
      await restoreTransformer(id);
      await refreshData();
      setNotice('Transformador restaurado al inventario activo.');
      return true;
    } catch (error) {
      console.error('Could not restore the transformer:', error);
      setActionError(errorText(error));
      return false;
    } finally {
      setPendingId('');
    }
  };

  const handleStrategyChange = (strategy, forceDegradedMode) =>
    runAction(() => setStrategyConfig(strategy, forceDegradedMode), 'Configuración de IA actualizada.');

  const handleSimulatorChange = async (active, scenario) => {
    setPendingId('simulator');
    await runAction(() => setSimulatorConfig(active, scenario),
      active ? `Escenario ${scenario} aplicado; simulador activo.` : `Escenario ${scenario} actualizado; simulador pausado.`);
    setPendingId('');
  };

  const renderPage = () => {
    const claudeQuotaExhausted = claudeStatus.remainingRequests === 0;
    const claudeUnavailableMessage = claudeQuotaExhausted
      ? 'Se agotó la cuota diaria configurada para Claude. Las funciones locales de GridMind siguen disponibles; la cuota se restablece al iniciar el nuevo día UTC.'
      : 'Claude no está configurado. Añade CLAUDE_API_KEY al entorno del backend y reinícialo.';
    if (page === 'assets') return <AssetsPage
      substations={substations}
      assets={assets}
      archivedAssets={archivedAssets}
      archivedLoading={archivedLoading}
      archivedError={archivedError}
      onLoadArchived={handleLoadArchived}
      onSelect={(id) => { setSelectedAssetId(id); setPage('simulator'); }}
      onClaudePredict={handleClaudePrediction}
      claudeEnabled={claudeStatus.enabled}
      claudeUnavailableMessage={claudeUnavailableMessage}
      predictingId={predictingAssetId}
      onCreateTransformer={handleCreateTransformer}
      onLinkSensor={async (id, code) => {
        await linkTemperatureSensor(id, code);
        await refreshData();
      }}
      onRenameTransformer={handleRenameTransformer}
      onArchiveTransformer={handleArchiveTransformer}
      onRestoreTransformer={handleRestoreTransformer}
      creating={pendingId === 'create-transformer'}
      actionPendingId={pendingId}
      canManageAssets={currentUser.role !== 'DEMO'}
    />;
    if (page === 'alerts') return <AlertsPage alerts={alerts} onAcknowledge={handleAcknowledge} pendingId={pendingId} readOnly={false} />;
    if (page === 'simulator') return <SimulatorPage key={selectedAssetId} assets={assets} history={simulations} onRefresh={refreshData} selectedAssetId={selectedAssetId} onError={(error) => { setActionError(errorText(error)); console.error('Could not run the simulation:', error); }} />;
    if (page === 'operations') return <OperationsPage maintenances={maintenances} assets={assets} alerts={alerts} health={health} telemetryStatus={telemetryStatus} simulatorConfig={simulatorConfiguration} onComplete={handleMaintenance} onCommand={handleCommand} onUndoCommand={handleUndoCommand} pendingId={pendingId} onStrategyChange={handleStrategyChange} onSimulatorChange={handleSimulatorChange}
      onManualTelemetry={(id, values) => runAction(() => applyManualTelemetry(id, values), 'Escenario aplicado. Revisa Alertas después de la próxima lectura.')}
      onClearManualTelemetry={() => runAction(clearManualTelemetry, 'Escenario manual desactivado.')}
      onViewAlerts={() => setPage('alerts')} canConfigure readOnly={false} />;
    return <Overview assets={assets} alerts={alerts} setPage={setPage} loading={loading} />;
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
          <div className="sidebar-user"><span className="avatar">{currentUser.displayName.slice(0, 2).toUpperCase()}</span><span className="sidebar-user-copy"><strong>{currentUser.displayName}</strong><small>Operador</small></span><button className="logout-button" onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={16} /></button></div>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div className="breadcrumb"><span>GridMind</span><span className="breadcrumb-separator">/</span><strong>{currentPage.label}</strong></div>
          <div className="topbar-actions">
            <span className={`connection-pill ${health?.status === 'UP' ? 'connected' : 'disconnected'}`}><i />{health?.status === 'UP' ? 'Sistema conectado' : 'Sin conexión'}</span>
            <span className="connection-pill connected" title="El panel consulta las lecturas de tu cuenta periódicamente"><i />Actualización automática</span>
            <span className={`connection-pill data-source-pill ${telemetryStatus?.recentDataSource && telemetryStatus.recentDataSource !== 'NONE' ? 'connected' : 'disconnected'}`} title="Origen de las lecturas recibidas durante los últimos 60 segundos"><i />{recentDataSourceLabel(telemetryStatus?.recentDataSource)}</span>
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
          <footer className="page-footer"><span>GRIDMIND AI <i>·</i> Supervisión de redes eléctricas</span><span>Java 25 <i>·</i> Actualización por cuenta</span></footer>
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
