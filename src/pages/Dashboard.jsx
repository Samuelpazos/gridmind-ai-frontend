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
