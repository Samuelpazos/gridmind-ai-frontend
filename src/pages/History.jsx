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
