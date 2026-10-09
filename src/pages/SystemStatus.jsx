import React, { useState, useEffect } from 'react';
import { getHealth } from '../services/api';
import { Activity, Database, Radio, Cpu, ShieldCheck, Server } from 'lucide-react';

const SystemStatus = () => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await getHealth();
        setHealth(res.data);
      } catch (err) {
        console.error('Error fetching health:', err);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-cyan-400" />
          Estado de Salud Diagnóstico del Sistema
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-1">
          Verificación diagnóstica de servicios backend, PostgreSQL, WebSocket y Motor IA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="h-4 w-4 text-cyan-400" />
            Servicio Backend Spring Boot 3
          </h3>
