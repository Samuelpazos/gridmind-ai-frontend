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
