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
