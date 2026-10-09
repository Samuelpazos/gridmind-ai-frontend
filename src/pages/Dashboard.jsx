import React, { useState } from 'react';
import { useGrid } from '../context/GridContext';
import StatusBadge from '../components/StatusBadge';
import { setSimulatorConfig } from '../services/api';
import {
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp,
  SlidersHorizontal,
  Wrench,
  BrainCircuit,
  Cpu,
  Building2,
  Play,
  ArrowRight,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Bell
} from 'lucide-react';

const tractianModules = [
  { id: 'monitoring', title: 'Monitoreo en tiempo real', icon: Activity, description: 'Telemetría continua de transformadores <3s', tab: 'monitoring' },
  { id: 'alerts', title: 'Prevención de paros', icon: AlertTriangle, description: 'Alertas tempranas antes de falla catastrófica', tab: 'alerts' },
  { id: 'asset-health', title: 'Salud de activos', icon: Zap, description: 'Diagnóstico de aislamiento, aceite y vibración', tab: 'transformer-detail' },
  { id: 'ranking', title: 'Reportes e indicadores', icon: TrendingUp, description: 'Ranking de riesgo priorizado (Riesgo x Impacto)', tab: 'ranking' },
  { id: 'maintenance', title: 'Mantenimiento preventivo', icon: Wrench, description: 'Recomendaciones e intervenciones en planta', tab: 'maintenance' },
  { id: 'ai-config', title: 'Inteligencia predictiva (IA)', icon: BrainCircuit, description: 'Modelos nativos Java Smile (Random Forest)', tab: 'ai-config' },
  { id: 'hierarchy', title: 'Visibilidad toda la planta', icon: Building2, description: 'Estructura Composite: Subestación > Transformador', tab: 'monitoring' },
  { id: 'simulator', title: 'Diagnóstico de fallas (Lab)', icon: SlidersHorizontal, description: 'Simulación hipotética de escenarios What-If', tab: 'simulator' },
  { id: 'model-info', title: 'Métricas e Integración', icon: Cpu, description: 'Precision, Recall >85%, F1, ROC-AUC', tab: 'model-info' }
];

const Dashboard = () => {
  const { summary, gridData, setActiveTab, setSelectedTransformerId, refreshData } = useGrid();
  const [selectedModule, setSelectedModule] = useState('monitoring');

  const handleSelectTransformer = (id) => {
    setSelectedTransformerId(id);
    setActiveTab('transformer-detail');
  };

  const handleQuickScenario = async (scenario) => {
    try {
      await setSimulatorConfig(true, scenario);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="tractian-hero-bg min-h-screen p-8 space-y-12 font-sans text-slate-100">
      
      {/* TRACTIAN HERO SECTION (Matching User's Screenshot 2) */}
      <div className="max-w-6xl mx-auto text-center space-y-6 pt-6">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-4 py-1.5 rounded-full border border-cyan-500/40">
          MONITOREO DE LA SALUD DE ACTIVOS Y RED ELÉCTRICA
        </span>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Protege la operación. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
            Incrementa la disponibilidad.
          </span>
        </h1>

        <p className="text-slate-300 text-base md:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
          Anticipa fallas térmicas y mecánicas en transformadores y acelera la respuesta en la red eléctrica con sensores inteligentes e inteligencia artificial nativa en Java.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('simulator')}
            className="btn-tractian-primary text-sm uppercase tracking-wide font-extrabold"
          >
            <Play className="h-4 w-4 fill-current" />
            Iniciar Simulación en Vivo
          </button>
          
          <button
            onClick={() => setActiveTab('monitoring')}
            className="btn-tractian-outline text-sm font-semibold"
          >
            Ver Diagnóstico en Tiempo Real
          </button>
        </div>
      </div>

      {/* TRACTIAN 9 INTERACTIVE MODULE CARDS BAR (Matching User's Screenshot 2 Bottom Selector) */}
      <div className="max-w-6xl mx-auto space-y-3">
        <p className="text-xs text-center font-bold text-slate-400 uppercase tracking-widest">
          Elige por dónde empezar (Haz clic para explorar el módulo):
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {tractianModules.map((mod) => {
            const Icon = mod.icon;
            const isSelected = selectedModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setSelectedModule(mod.id);
                  setActiveTab(mod.tab);
                }}
                className={`tractian-module-card ${isSelected ? 'active' : ''}`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight">
                  {mod.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TRACTIAN ASSET CONDITION KPI CARDS GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="tractian-card p-6 space-y-2 text-center border-t-4 border-t-blue-500">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Subestaciones</span>
          <div className="text-4xl font-extrabold text-white font-mono">{summary?.totalSubstations || 0}</div>
          <p className="text-xs text-slate-400">Redes Norte, Centro y Sur</p>
        </div>

        <div className="tractian-card p-6 space-y-2 text-center border-t-4 border-t-cyan-400">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Transformadores Activos</span>
          <div className="text-4xl font-extrabold text-cyan-400 font-mono">{summary?.totalTransformers || 0}</div>
          <p className="text-xs text-slate-400">{summary?.activeSensors || 0} Sensores Telemetría</p>
        </div>

        <div className="tractian-card p-6 space-y-2 text-center border-t-4 border-t-rose-500">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Alertas Pendientes</span>
          <div className="text-4xl font-extrabold text-rose-400 font-mono">{summary?.pendingAlerts || 0}</div>
          <p className="text-xs text-slate-400">Requieren atención de operador</p>
        </div>

        <div className="tractian-card p-6 space-y-2 text-center border-t-4 border-t-emerald-400">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">IA Smile Engine</span>
          <div className="text-lg font-bold text-emerald-400 font-mono truncate">{summary?.activeStrategy || 'SUPERVISED'}</div>
          <p className="text-xs text-slate-400">Recall: 91% (&gt;85% Requisito)</p>
        </div>
      </div>

      {/* INTERACTIVE SCENARIO CONTROLLER */}
      <div className="max-w-6xl mx-auto tractian-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Play className="h-4 w-4 text-cyan-400 fill-current" />
            Control de Escenarios de Telemetría en Tiempo Real
          </h3>
          <span className="text-xs text-slate-400">Haz clic para conmutar las lecturas de los sensores:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          <button
            onClick={() => handleQuickScenario('NORMAL')}
            className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-900/50 transition"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400" /> 1. Operación Normal Estable
          </button>

          <button
            onClick={() => handleQuickScenario('GRADUAL_DEGRADATION')}
            className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-900/50 transition"
          >
            <AlertTriangle className="h-5 w-5 text-amber-400" /> 2. Degradación Gradual (T-C-001)
          </button>

          <button
            onClick={() => handleQuickScenario('SUDDEN_FAILURE')}
            className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-300 font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-rose-900/50 transition"
          >
            <Flame className="h-5 w-5 text-rose-400" /> 3. Falla Súbita (Pico Térmico)
          </button>
        </div>
      </div>

      {/* GRID HIERARCHY ASSET MAP */}
      <div className="max-w-6xl mx-auto tractian-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-400" />
              Jerarquía de Subestaciones y Transformadores
            </h3>
            <p className="text-xs text-slate-400">Estructura jerárquica con cálculo de peor estado (Patrón Composite)</p>
          </div>
          <button
            onClick={() => setActiveTab('monitoring')}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            Ver Mapa SCADA Completo <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gridData.map((sub) => (
            <div key={sub.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                  <span className="text-xs text-slate-400 font-mono">{sub.code} • {sub.type}</span>
                </div>
                <StatusBadge status={sub.status} />
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-400 font-medium">Transformadores:</p>
                {sub.transformers?.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTransformer(t.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900/90 hover:bg-slate-850 text-xs border border-slate-800 transition text-left cursor-pointer group"
                  >
                    <div>
                      <span className="font-bold text-slate-200 group-hover:text-cyan-400 transition block">{t.name}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        Prob. Falla: <strong className="text-cyan-400 font-bold">{(t.failureProbability * 100).toFixed(1)}%</strong>
                      </span>
                    </div>
                    <StatusBadge status={t.status} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
