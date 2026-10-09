import React, { useState, useEffect } from 'react';
import { useGrid } from '../context/GridContext';
import { getRiskRanking } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { TrendingUp, Award, ArrowRight } from 'lucide-react';

const RiskRanking = () => {
  const { setActiveTab, setSelectedTransformerId } = useGrid();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await getRiskRanking();
        setRanking(res.data);
      } catch (err) {
        console.error('Error fetching risk ranking:', err);
      }
    };
    fetchRanking();
    const interval = setInterval(fetchRanking, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (id) => {
    setSelectedTransformerId(id);
    setActiveTab('transformer-detail');
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="border-b border-slate-800/80 pb-6">
        <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-cyan-400" />
          Ranking de Riesgo y Priorización de Componentes
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-0.5">
          Ordenamiento Priorizado de Transformadores: Prioridad = Riesgo (%) &times; Impacto (Capacidad kVA)
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 font-mono text-xs border-b border-slate-800">
              <th className="p-4 font-bold w-16 text-center">Posición</th>
              <th className="p-4 font-bold">Transformador</th>
              <th className="p-4 font-bold">Subestación</th>
              <th className="p-4 font-bold">Nivel de Riesgo</th>
              <th className="p-4 font-bold">Probabilidad Falla</th>
              <th className="p-4 font-bold">Impacto</th>
              <th className="p-4 font-bold">Prioridad Score</th>
              <th className="p-4 font-bold">Estado</th>
              <th className="p-4 font-bold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {ranking.map((item) => (
              <tr key={item.transformerId} className="hover:bg-slate-850/50 transition">
                <td className="p-4 text-center font-bold">
                  {item.rankPosition === 1 ? (
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 glow-amber">
                      <Award className="h-4 w-4" />
                    </span>
