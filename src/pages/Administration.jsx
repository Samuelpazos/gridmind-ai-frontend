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
