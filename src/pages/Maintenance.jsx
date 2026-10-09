import React, { useState, useEffect } from 'react';
import { getMaintenances, completeMaintenance } from '../services/api';
import { Wrench, CheckCircle, Clock } from 'lucide-react';

const Maintenance = () => {
  const [list, setList] = useState([]);

  const fetchMaintenances = async () => {
    try {
      const res = await getMaintenances();
      setList(res.data);
    } catch (err) {
      console.error('Error fetching maintenances:', err);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const handleComplete = async (id) => {
    try {
      await completeMaintenance(id, 'Mantenimiento preventivo completado y verificado en campo.');
      fetchMaintenances();
    } catch (err) {
      console.error('Error completing maintenance:', err);
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
          <Wrench className="h-6 w-6 text-cyan-400" />
