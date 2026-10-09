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
                  ) : (
                    <span className="text-slate-400 font-extrabold">#{item.rankPosition}</span>
                  )}
                </td>
                <td className="p-4 font-extrabold text-slate-100">
                  <div>{item.transformerName}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.transformerCode}</div>
                </td>
                <td className="p-4 text-slate-300">{item.substationName}</td>
                <td className="p-4 font-extrabold text-cyan-400">{item.riskLevel}</td>
                <td className="p-4 font-extrabold text-slate-100">{(item.failureProbability * 100).toFixed(1)}%</td>
                <td className="p-4 text-slate-400">{item.impactScore?.toFixed(0)} pts</td>
                <td className="p-4 text-lg font-black text-rose-400">{item.priorityScore?.toFixed(1)}</td>
                <td className="p-4"><StatusBadge status={item.status} size="sm" /></td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleSelect(item.transformerId)}
                    className="bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-bold px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] flex items-center gap-1.5 ml-auto transition"
                  >
                    Ver Detalle <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskRanking;
