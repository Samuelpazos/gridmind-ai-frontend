import React, { useState, useEffect } from 'react';
import { getModelInfo, getDemoReferenceScenario } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Cpu, Award, Play, CheckCircle2, Sparkles } from 'lucide-react';

const ModelInfo = () => {
  const [info, setInfo] = useState(null);
  const [refScenarioResult, setRefScenarioResult] = useState(null);
  const [testingRef, setTestingRef] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getModelInfo();
        setInfo(res.data);
      } catch (err) {
        console.error('Error fetching model info:', err);
      }
    };
    fetchInfo();
  }, []);

  const handleTestReferenceScenario = async () => {
    setTestingRef(true);
    try {
      const res = await getDemoReferenceScenario();
      setRefScenarioResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTestingRef(false);
    }
  };

  const featureChartData = info?.featureImportances
    ? Object.entries(info.featureImportances).map(([name, val]) => ({
        feature: name,
        importance: Math.round(val * 100)
      }))
    : [];

  return (
    <div className="p-8 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-400" />
            Métricas del Modelo de IA Smile (Java Native Engine)
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">
            Evaluación de Desempeño sobre Dataset Sintético Reproducible (Semilla Fija 42)
          </p>
        </div>
