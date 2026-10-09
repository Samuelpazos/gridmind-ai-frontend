import React, { useState } from 'react';
import { useGrid } from '../context/GridContext';
import { setSimulatorConfig } from '../services/api';
import { Settings, Play, Pause, CheckCircle2 } from 'lucide-react';

const Administration = () => {
  const { summary, refreshData } = useGrid();
  const [simActive, setSimActive] = useState(true);
  const [scenario, setScenario] = useState('NORMAL');
  const [msg, setMsg] = useState(null);

  const handleUpdateSimulator = async (activeState, scenarioState) => {
    try {
      await setSimulatorConfig(activeState, scenarioState);
      setSimActive(activeState);
      setScenario(scenarioState);
      setMsg(`Simulador actualizado: ${activeState ? 'ACTIVO' : 'PAUSADO'} (Escenario: ${scenarioState})`);
      refreshData();
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-400" />
          Administración del Sistema y Simulador
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-1">
          Configuración global del generador de lecturas y parámetros de red
        </p>
      </div>

      {msg && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-4 rounded-lg font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {msg}
        </div>
      )}

      {/* Simulator Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider border-b border-slate-800 pb-3">
          Controlador de Simulador de Sensores en Tiempo Real (Sección 7)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
          <button
            onClick={() => handleUpdateSimulator(true, 'NORMAL')}
            className={`p-5 rounded-lg border text-left space-y-2 transition ${
              scenario === 'NORMAL' && simActive
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 glow-normal'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            <div className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <Play className="h-4 w-4 fill-current" /> 1. ESCENARIO NORMAL
            </div>
            <p className="text-[11px] text-slate-400">Lecturas estables dentro de rangos nominales de tolerancia.</p>
          </button>

          <button
            onClick={() => handleUpdateSimulator(true, 'GRADUAL_DEGRADATION')}
            className={`p-5 rounded-lg border text-left space-y-2 transition ${
              scenario === 'GRADUAL_DEGRADATION' && simActive
                ? 'bg-amber-950/60 border-amber-700 text-amber-300 glow-warning'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            <div className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <Play className="h-4 w-4 fill-current" /> 2. DEGRADACIÓN GRADUAL
