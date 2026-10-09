import React, { useState } from 'react';
import { useGrid } from '../context/GridContext';
import StatusBadge from '../components/StatusBadge';
import { Network, Building2, Zap, Radio, ChevronRight, Filter } from 'lucide-react';

const NetworkMonitoring = () => {
  const { gridData, setActiveTab, setSelectedTransformerId } = useGrid();
  const [filterType, setFilterType] = useState('ALL');

  const handleSelectTransformer = (id) => {
    setSelectedTransformerId(id);
    setActiveTab('transformer-detail');
  };

  const filteredGrid = gridData.filter((sub) => {
    if (filterType === 'ALL') return true;
    return sub.type === filterType;
  });

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <Network className="h-6 w-6 text-cyan-400" />
            Diagrama Topológico SCADA de Red Eléctrica
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">
            Vista Gráfica Interactiva: Subestación (Composite Parent) &rarr; Transformadores (Nodes) &rarr; Telemetría
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">Todas las Redes (Urbana e Industrial)</option>
              <option value="URBAN">Red Urbana (Residencial)</option>
              <option value="INDUSTRIAL">Red Industrial (Alta Potencia)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Topology Diagram & Grid List */}
      <div className="space-y-8">
        {filteredGrid.map((substation) => (
          <div key={substation.id} className="glass-panel rounded-2xl p-6 space-y-6">
            {/* Substation Parent Node Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 glow-cyan">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    {substation.name}
                    <span className="text-xs text-cyan-400 font-mono font-normal">({substation.code})</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Ubicación: <strong className="text-slate-200">{substation.location}</strong> • Red: <strong className="text-cyan-300">{substation.type}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">Estado Agregado (Peor Componente):</span>
                <StatusBadge status={substation.status} />
              </div>
            </div>

            {/* SVG Visual Energy Connectors & Transformer Cards Grid */}
            <div className="relative pl-6 border-l-2 border-cyan-500/30 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {substation.transformers?.map((trans) => (
                  <div
                    key={trans.id}
                    className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4 glass-panel-hover group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Zap className="h-4 w-4" />
                        </div>
                        <span className="font-extrabold text-slate-100 text-sm group-hover:text-cyan-400 transition">{trans.name}</span>
                      </div>
