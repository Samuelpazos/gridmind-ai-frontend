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
            activeStrategy.includes('SUPERVISED') && !degradedMode
              ? 'border-cyan-500 glow-cyan bg-slate-900/90'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between font-mono">
            <span className="font-extrabold text-white text-base">1. Supervised Model (Random Forest)</span>
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Modelo supervisado entrenado nativamente en Java con Smile. Predice probabilidad exacta de falla y factores de mayor influjo.
          </p>
          <div className="text-xs text-cyan-300 font-mono font-bold">Precisión: 89% • Recall: 91% (&gt;85%)</div>
        </div>

        <div
          onClick={() => handleApply('ISOLATION_FOREST_STRATEGY', false)}
          className={`glass-panel p-6 rounded-2xl cursor-pointer transition-all space-y-3 ${
            activeStrategy.includes('ISOLATION') && !degradedMode
              ? 'border-cyan-500 glow-cyan bg-slate-900/90'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between font-mono">
            <span className="font-extrabold text-white text-base">2. Isolation Forest (Detección Anomalías)</span>
            <BrainCircuit className="h-6 w-6 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Detección no supervisada de anomalías estadísticas aisladas en la telemetría multivariada.
          </p>
          <div className="text-xs text-cyan-300 font-mono font-bold">Calcula Anomaly Score en Tiempo Real</div>
        </div>

        <div
          onClick={() => handleApply('THRESHOLD_STRATEGY', false)}
          className={`glass-panel p-6 rounded-2xl cursor-pointer transition-all space-y-3 ${
            activeStrategy.includes('THRESHOLD') && !degradedMode
              ? 'border-amber-500 glow-amber bg-slate-900/90'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between font-mono">
            <span className="font-extrabold text-white text-base">3. Threshold Strategy (Reglas de Umbral)</span>
            <Sliders className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Evaluación por umbrales rígidos de tolerancia eléctrica (Temperatura &gt; 85°C, Vibración &gt; 4.5mm/s).
          </p>
        </div>

        <div
          onClick={() => handleApply('WEIGHTED_AGE_STRATEGY', false)}
          className={`glass-panel p-6 rounded-2xl cursor-pointer transition-all space-y-3 ${
            activeStrategy.includes('WEIGHTED_AGE') && !degradedMode
              ? 'border-cyan-500 glow-cyan bg-slate-900/90'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between font-mono">
            <span className="font-extrabold text-white text-base">4. Weighted Age Strategy (Ponderado Antigüedad)</span>
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Ponderación del riesgo priorizada por años de servicio y estrés acumulado.
          </p>
        </div>
      </div>

      {/* RNF-08 Fallback Banner */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 font-mono border-amber-500/60 glow-amber">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-200 uppercase">Simulación de Mecanismo Fallback IA (Requisito RNF-08)</h3>
              <p className="text-xs text-amber-300/80">
                Si la IA se degrada o falla, el sistema conmuta automáticamente a evaluación mediante reglas sin detenerse.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleApply(activeStrategy, !degradedMode)}
            className={`px-5 py-2.5 rounded-xl font-mono font-black text-xs transition ${
              degradedMode
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg glow-amber'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
            }`}
          >
            {degradedMode ? 'DESACTIVAR MODO DEGRADADO' : 'FORZAR MODO DEGRADADO (RNF-08)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiConfig;
