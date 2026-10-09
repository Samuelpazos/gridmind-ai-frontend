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
