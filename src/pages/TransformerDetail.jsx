import React, { useState, useEffect } from 'react';
import { useGrid } from '../context/GridContext';
import { getComponentRisk, getComponentReadings, executeCommand } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Zap, BrainCircuit, Activity, AlertTriangle, CheckCircle, Wrench, Flame, Gauge, Thermometer, ShieldAlert } from 'lucide-react';

const TransformerDetail = () => {
  const { selectedTransformerId } = useGrid();
  const [transformer, setTransformer] = useState(null);
  const [readingsHistory, setReadingsHistory] = useState([]);
  const [activeSensorType, setActiveSensorType] = useState('TEMPERATURE');
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    if (!selectedTransformerId) return;

    const fetchDetail = async () => {
      try {
        const resRisk = await getComponentRisk(selectedTransformerId);
        setTransformer(resRisk.data);

        const sensors = resRisk.data.sensors || [];
        const sensor = sensors.find((s) => s.type === activeSensorType) || sensors[0];
        if (sensor) {
          const resReadings = await getComponentReadings(sensor.id);
          const formatted = resReadings.data
            .map((r) => ({
              time: new Date(r.timestamp).toLocaleTimeString(),
              value: r.value,
              unit: r.unit
            }))
            .reverse();
          setReadingsHistory(formatted);
        }
      } catch (err) {
        console.error('Error fetching transformer details:', err);
      }
    };

    fetchDetail();
    const interval = setInterval(fetchDetail, 3000);
    return () => clearInterval(interval);
  }, [selectedTransformerId, activeSensorType]);

  const handleSimulateFailure = async () => {
    try {
      await executeCommand('SIMULATE_FAILURE', selectedTransformerId);
      setActionMsg('Comando de Simulación de Falla ejecutado.');
      setTimeout(() => setActionMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleMaintenance = async () => {
    try {
      await executeCommand('SCHEDULE_MAINTENANCE', selectedTransformerId, {
        recommendation: 'Inspeccionar el sistema de refrigeración del transformador.'
      });
      setActionMsg('Mantenimiento preventivo programado correctamente.');
      setTimeout(() => setActionMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!transformer) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Cargando analítica avanzada de transformador ({selectedTransformerId})...
      </div>
    );
  }

  const latestPred = transformer.latestPrediction;
  const failurePct = (transformer.failureProbability * 100).toFixed(1);

  return (
    <div className="p-8 space-y-8 font-sans">
      {actionMsg && (
        <div className="bg-cyan-950 border border-cyan-500 text-cyan-200 p-4 rounded-xl font-mono text-xs flex items-center gap-2 glow-cyan">
          <CheckCircle className="h-4 w-4 text-cyan-400" />
          {actionMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-400" />
              {transformer.name}
            </h2>
            <StatusBadge status={transformer.status} />
          </div>
          <p className="text-slate-400 text-xs font-mono mt-1">
            Código: <strong className="text-cyan-400">{transformer.code}</strong> • Subestación: <strong className="text-slate-200">{transformer.substationName}</strong> • Capacidad: <strong className="text-slate-200">{transformer.ratingKva} kVA</strong> • Edad: <strong className="text-slate-200">{transformer.ageYears} años</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={handleScheduleMaintenance}
            className="flex items-center gap-2 bg-slate-850 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl font-bold transition border border-slate-750 shadow-md"
          >
            <Wrench className="h-4 w-4 text-cyan-400" />
            Programar Mantenimiento
          </button>
          <button
            onClick={handleSimulateFailure}
            className="flex items-center gap-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 font-bold px-4 py-2.5 rounded-xl transition glow-rose shadow-lg"
          >
            <Flame className="h-4 w-4 text-rose-400" />
            Simular Falla In situ
          </button>
        </div>
      </div>

      {/* Telemetry Gauge Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 font-mono">
        {transformer.sensors?.map((s) => (
          <div key={s.id} className="glass-panel rounded-2xl p-5 space-y-2 text-center relative overflow-hidden">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">{s.type}</span>
            <div className="text-3xl font-extrabold text-cyan-300">
              {s.latestReading ? `${s.latestReading.value} ${s.latestReading.unit}` : '--'}
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                style={{ width: `${Math.min(100, (s.latestReading?.value || 50) * 0.8)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Probability Gauge & AI Explainability Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Probability Gauge Card */}
        <div className="glass-panel rounded-2xl p-6 text-center space-y-4 flex flex-col justify-center items-center relative overflow-hidden">
          <span className="text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">Probabilidad de Falla IA</span>
          <div className="text-5xl font-black font-mono text-cyan-400 tracking-tight drop-shadow-md">
            {failurePct}%
          </div>
          <div className="w-full bg-slate-850 h-4 rounded-full overflow-hidden p-1 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 stripe-animated ${
                transformer.failureProbability > 0.6 ? 'bg-rose-500 glow-rose' : transformer.failureProbability > 0.3 ? 'bg-amber-500 glow-amber' : 'bg-emerald-500 glow-emerald'
              }`}
              style={{ width: `${Math.min(100, transformer.failureProbability * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs font-mono text-slate-300">Nivel de Riesgo: <strong className="text-cyan-300 font-bold">{transformer.riskLevel}</strong></p>
        </div>

        {/* AI Factors & Explainability Box */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 uppercase tracking-wider">
            <BrainCircuit className="h-5 w-5 text-cyan-400" />
            Explicabilidad del Modelo de IA (Sección 11)
          </h3>

          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-slate-200 font-bold flex items-center gap-2 text-sm">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
              {latestPred?.explanation || 'Evaluación continua dentro de tolerancias nominales de operación.'}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-900 text-slate-300">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Variables de Mayor Influjo:</p>
              {latestPred?.topFactorsList?.map((factor, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-slate-200 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-850">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="font-semibold">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Area Chart */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Gráfica Temporal de Telemetría (Recharts Time-Series)
          </h3>

          <div className="flex gap-2 font-mono text-xs">
            {['TEMPERATURE', 'VOLTAGE', 'CURRENT', 'VIBRATION'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveSensorType(type)}
                className={`px-3.5 py-2 rounded-xl border font-bold transition ${
                  activeSensorType === type
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 glow-cyan'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={readingsHistory}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" dot={{ r: 4, fill: '#06b6d4' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TransformerDetail;
