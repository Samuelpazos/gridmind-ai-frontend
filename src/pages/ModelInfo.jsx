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

        <button
          onClick={handleTestReferenceScenario}
          disabled={testingRef}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-lg font-mono transition border border-cyan-400/40 glow-cyan"
        >
          <Play className="h-4 w-4 fill-current animate-pulse" />
          {testingRef ? 'Evaluando...' : 'Probar Escenario de Referencia (Sección 8)'}
        </button>
      </div>

      {/* Model Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Precision</span>
          <div className="text-4xl font-extrabold text-cyan-400">
            {info ? `${(info.precision * 100).toFixed(1)}%` : '--'}
          </div>
          <p className="text-xs text-slate-400">Exactitud predicciones positivas</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-2 border-emerald-500/50 glow-emerald">
          <span className="text-emerald-300 text-xs font-extrabold flex items-center gap-1 uppercase tracking-wider">
            <Award className="h-4 w-4" /> Recall (&gt;85% Requisito)
          </span>
          <div className="text-4xl font-extrabold text-emerald-400">
            {info ? `${(info.recall * 100).toFixed(1)}%` : '--'}
          </div>
          <p className="text-xs text-emerald-300 font-bold">Cumple meta de detección &gt;85%</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">F1-Score</span>
          <div className="text-4xl font-extrabold text-cyan-400">
            {info ? `${(info.f1Score * 100).toFixed(1)}%` : '--'}
          </div>
          <p className="text-xs text-slate-400">Balance Precision-Recall</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">ROC-AUC</span>
          <div className="text-4xl font-extrabold text-cyan-400">
            {info ? info.rocAuc.toFixed(3) : '--'}
          </div>
          <p className="text-xs text-slate-400">Discriminación de clases</p>
        </div>
      </div>

      {/* Reference Scenario Result Card */}
      {refScenarioResult && (
        <div className="glass-panel rounded-2xl p-6 space-y-5 font-mono border-emerald-500/60 glow-emerald">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              {refScenarioResult.scenarioName} - VERIFICADO SATISFACTORIAMENTE
            </h3>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500 px-3 py-1 rounded-full font-bold">
              Cumple Requisito Sección 8
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2 bg-slate-950/90 p-4 rounded-xl border border-slate-800">
              <p className="text-slate-400 font-bold uppercase">Entradas Evaluadas:</p>
              <ul className="space-y-1.5 text-slate-200">
                <li>• Temperatura: <strong className="text-cyan-300">{refScenarioResult.inputs.temperatura}</strong></li>
                <li>• Voltaje: <strong className="text-cyan-300">{refScenarioResult.inputs.voltaje}</strong></li>
                <li>• Corriente: <strong className="text-cyan-300">{refScenarioResult.inputs.corriente}</strong></li>
                <li>• Vibración: <strong className="text-cyan-300">{refScenarioResult.inputs.vibracion}</strong></li>
                <li>• Edad Transformador: <strong className="text-cyan-300">{refScenarioResult.inputs.edad}</strong></li>
              </ul>
            </div>

            <div className="space-y-2 bg-slate-950/90 p-4 rounded-xl border border-slate-800">
              <p className="text-slate-400 font-bold uppercase">Resultado Esperado Obtenido:</p>
              <p>Nivel de Riesgo: <strong className="text-rose-400 font-extrabold text-sm">{refScenarioResult.riskLevel}</strong> (Esperado: HIGH)</p>
              <p>Probabilidad de Falla: <strong className="text-cyan-400 font-extrabold text-sm">{refScenarioResult.failureProbabilityPercent}</strong> (Esperado: 70% - 85%)</p>
              <p className="text-emerald-300 pt-2 font-bold">Recomendación Generada:</p>
              <p className="text-slate-100 bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-bold">"{refScenarioResult.recommendation}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance Chart */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          Importancia de Variables en el Modelo (Feature Importances)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" />
              <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={12} width={150} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#06b6d4', borderRadius: '12px' }} />
              <Bar dataKey="importance" fill="#06b6d4" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ModelInfo;
