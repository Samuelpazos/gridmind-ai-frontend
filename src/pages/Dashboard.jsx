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
