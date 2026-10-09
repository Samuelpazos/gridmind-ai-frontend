import React, { useState } from 'react';
import { useGrid } from '../context/GridContext';
import { runSimulation } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { SlidersHorizontal, Play, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';

const FaultSimulator = () => {
  const { gridData } = useGrid();
  const [selectedSubId, setSelectedSubId] = useState('sub-003');
  const [selectedTransId, setSelectedTransId] = useState('trans-005');
  const [variable, setVariable] = useState('TEMPERATURE');
  const [deltaPercent, setDeltaPercent] = useState(30.0);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedSub = gridData.find((s) => s.id === selectedSubId) || gridData[0];
  const transformers = selectedSub?.transformers || [];

  const handleRun = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await runSimulation({
        transformerId: selectedTransId,
        variableModified: variable,
        deltaPercent: parseFloat(deltaPercent)
      });
      setSimResult(res.data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="border-b border-slate-800/80 pb-6">
        <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6 text-cyan-400" />
          Laboratorio de Simulación de Fallas What-If
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-0.5">
          Evaluación de escenarios hipotéticos de estrés sin modificar la base de datos operativa real (Sección 18)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulation Controls Panel */}
        <div className="glass-panel rounded-2xl p-6 space-y-5 h-fit">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            Parámetros de Simulación
          </h3>

          <form onSubmit={handleRun} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Subestación Objetivo</label>
              <select
                value={selectedSubId}
                onChange={(e) => {
                  setSelectedSubId(e.target.value);
                  const sub = gridData.find((s) => s.id === e.target.value);
                  if (sub?.transformers?.length > 0) {
                    setSelectedTransId(sub.transformers[0].id);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-bold outline-none cursor-pointer focus:border-cyan-500"
              >
                {gridData.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Transformador Objetivo</label>
              <select
                value={selectedTransId}
                onChange={(e) => setSelectedTransId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-bold outline-none cursor-pointer focus:border-cyan-500"
              >
                {transformers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Variable de Telemetría</label>
              <select
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-bold outline-none cursor-pointer focus:border-cyan-500"
              >
                <option value="TEMPERATURE">Temperatura (°C)</option>
                <option value="VIBRATION">Vibración (mm/s)</option>
                <option value="CURRENT">Corriente (A)</option>
                <option value="VOLTAGE">Voltaje (kV)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-bold mb-2">
                <span>Magnitud de Incremento (%)</span>
                <span className="text-cyan-400 font-black text-sm">+{deltaPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={deltaPercent}
                onChange={(e) => setDeltaPercent(e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-cyan-950/60 font-mono text-xs border border-cyan-400/40 glow-cyan mt-4"
            >
              <Play className="h-4 w-4 fill-current animate-pulse" />
              {loading ? 'Calculando Modelo...' : 'Ejecutar Simulación Hypothetical'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {simResult ? (
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white font-mono">
                    Resultado Comparativo: {simResult.transformerName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Modificación simulada: <strong className="text-cyan-300">{simResult.variableModified} +{simResult.deltaPercent}%</strong>
                  </p>
