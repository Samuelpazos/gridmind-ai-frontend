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

