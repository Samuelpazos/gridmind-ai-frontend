import React, { useState } from 'react';
import { useGrid } from '../context/GridContext';
import { setStrategyConfig } from '../services/api';
import { BrainCircuit, AlertTriangle, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';

const AiConfig = () => {
  const { summary, refreshData } = useGrid();
  const [activeStrategy, setActiveStrategy] = useState(summary?.activeStrategy || 'SUPERVISED_MODEL_STRATEGY');
  const [degradedMode, setDegradedMode] = useState(summary?.isDegradedMode || false);
  const [msg, setMsg] = useState(null);

  const handleApply = async (strat, degraded) => {
    try {
      await setStrategyConfig(strat, degraded);
      setActiveStrategy(strat);
      setDegradedMode(degraded);
      setMsg(`Estrategia actualizada a: ${strat} ${degraded ? '(MODO DEGRADADO FORZADO RNF-08)' : ''}`);
      refreshData();
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      console.error('Error applying strategy:', err);
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="border-b border-slate-800/80 pb-6">
        <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-cyan-400" />
          Configuración de Estrategias de Inteligencia Artificial
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-0.5">
          Intercambio Dinámico de Estrategias en Runtime (Pattern Strategy) y Mecanismo Fallback (Requisito RNF-08)
        </p>
      </div>

      {msg && (
        <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-4 rounded-xl font-mono text-xs flex items-center gap-2 glow-emerald">
          <CheckCircle2 className="h-4 w-4" />
          {msg}
        </div>
      )}

      {/* Strategies Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => handleApply('SUPERVISED_MODEL_STRATEGY', false)}
          className={`glass-panel p-6 rounded-2xl cursor-pointer transition-all space-y-3 ${
