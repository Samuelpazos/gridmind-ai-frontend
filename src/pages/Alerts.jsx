import React, { useState } from 'react';
import { useGrid } from '../context/GridContext';
import { acknowledgeAlert } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Bell, CheckCircle, Filter } from 'lucide-react';

const Alerts = () => {
  const { alerts, refreshData } = useGrid();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterAck, setFilterAck] = useState('UNACK');

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id, 'OPERATOR');
      refreshData();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const filteredAlerts = alerts.filter((alt) => {
    if (filterSeverity !== 'ALL' && alt.severity !== filterSeverity) return false;
    if (filterAck === 'UNACK' && alt.acknowledged) return false;
    if (filterAck === 'ACK' && !alt.acknowledged) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-rose-400" />
            Centro de Gestión de Alertas Operativas
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">
            Monitoreo, filtrado y reconocimiento de eventos críticos en la red
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <select
              value={filterAck}
              onChange={(e) => setFilterAck(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">Todas las Alertas</option>
              <option value="UNACK">No Reconocidas</option>
              <option value="ACK">Reconocidas</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">Cualquier Severidad</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 font-mono text-xs border-b border-slate-800">
              <th className="p-4 font-bold">Severidad</th>
              <th className="p-4 font-bold">Componente / Subestación</th>
              <th className="p-4 font-bold">Mensaje Alerta</th>
              <th className="p-4 font-bold">Origen</th>
              <th className="p-4 font-bold">Fecha / Hora</th>
              <th className="p-4 font-bold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 font-mono">
                  No se encontraron alertas para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-850/50 transition">
                  <td className="p-4"><StatusBadge status={alt.severity} size="sm" /></td>
                  <td className="p-4 font-bold text-slate-100">
                    <div>{alt.transformerName || alt.transformerCode}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{alt.substationName}</div>
                  </td>
                  <td className="p-4 text-slate-200 max-w-md">{alt.message}</td>
                  <td className="p-4 text-cyan-400 font-semibold">{alt.source}</td>
                  <td className="p-4 text-slate-400 text-[11px]">{new Date(alt.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    {alt.acknowledged ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/50 glow-emerald">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Reconocida ({alt.acknowledgedBy})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alt.id)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition shadow-md glow-cyan"
                      >
                        Reconocer Alerta
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
