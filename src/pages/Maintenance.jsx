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
          Gestión de Recomendaciones y Mantenimiento Preventivo
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-1">
          Programación y registro de intervenciones para restablecer transformadores a estado NORMAL (Sección 17)
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-mono text-xs border-b border-slate-800">
              <th className="p-4 font-semibold">Transformador</th>
              <th className="p-4 font-semibold">Recomendación</th>
              <th className="p-4 font-semibold">Estado Mantenimiento</th>
              <th className="p-4 font-semibold">Fecha Programada</th>
              <th className="p-4 font-semibold">Resultado / Notas</th>
              <th className="p-4 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {list.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  No hay mantenimientos ni recomendaciones registradas.
                </td>
              </tr>
            ) : (
              list.map((m) => (
                <tr key={m.id} className="hover:bg-slate-850/50 transition">
                  <td className="p-4 font-bold text-slate-200">
                    <div>{m.transformerName || m.transformerCode}</div>
                  </td>
                  <td className="p-4 text-slate-300 max-w-sm">{m.recommendation}</td>
                  <td className="p-4">
                    {m.status === 'COMPLETED' ? (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        COMPLETADO
                      </span>
                    ) : (
                      <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {m.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 text-[11px]">
                    {m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : 'Pendiente'}
                  </td>
                  <td className="p-4 text-slate-400 text-[11px]">{m.resultNotes || '--'}</td>
                  <td className="p-4 text-right">
                    {m.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleComplete(m.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-bold text-[11px] transition shadow-sm"
                      >
                        Completar y Restablecer
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

export default Maintenance;
