import React, { useState, useEffect } from 'react';
import { getHistoryLogs } from '../services/api';
import { History, Search } from 'lucide-react';

const HistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getHistoryLogs();
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-cyan-400" />
            Historial General de Auditoría y Eventos
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Registro cronológico persistente de lecturas, predicciones, alertas, mantenimientos y comandos
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por evento o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-slate-200 outline-none w-full font-mono placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-mono text-xs border-b border-slate-800">
              <th className="p-4 font-semibold">Tipo Evento</th>
              <th className="p-4 font-semibold">Tipo Entidad</th>
              <th className="p-4 font-semibold">ID Entidad</th>
              <th className="p-4 font-semibold">Descripción del Evento</th>
              <th className="p-4 font-semibold text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No hay registros de historial coincidentes.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition">
                  <td className="p-4 font-bold text-cyan-400">{log.eventType}</td>
                  <td className="p-4 text-slate-300">{log.entityType}</td>
                  <td className="p-4 text-slate-400 text-[11px]">{log.entityId}</td>
                  <td className="p-4 text-slate-200 max-w-lg">{log.description}</td>
                  <td className="p-4 text-right text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
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

export default HistoryPage;
