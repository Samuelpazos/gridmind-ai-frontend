import React, { useState } from 'react';
import { getDemoReferenceScenario } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, Award, CheckCircle2, Cpu, Loader2, Play, Sparkles } from 'lucide-react';

const percentage = (value) => (Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : '—');

const ModelInfo = ({ info }) => {
  const [refScenarioResult, setRefScenarioResult] = useState(null);
  const [testingRef, setTestingRef] = useState(false);
  const [referenceError, setReferenceError] = useState('');

  const handleTestReferenceScenario = async () => {
    setTestingRef(true);
    setReferenceError('');
    try {
      const res = await getDemoReferenceScenario();
      setRefScenarioResult(res.data);
    } catch (err) {
      setReferenceError(err?.response?.data?.message || err?.message || 'No se pudo ejecutar el escenario de referencia.');
    } finally {
      setTestingRef(false);
    }
  };

  const datasetSize = Number.isFinite(info?.trainingSamplesCount) && Number.isFinite(info?.testSamplesCount)
    ? info.trainingSamplesCount + info.testSamplesCount
    : null;
  const featureChartData = info?.featureImportances
    ? Object.entries(info.featureImportances).map(([name, val]) => ({
        feature: name,
        importance: Math.round(val * 100)
      }))
    : [];
  const calculatedProbability = typeof refScenarioResult?.failureProbability === 'number'
    ? percentage(refScenarioResult.failureProbability)
    : refScenarioResult?.failureProbabilityPercent || '—';

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">SISTEMA DE ANÁLISIS</span>
          <h2>Información del Modelo</h2>
          <p>{info?.modelName || 'Métricas y alcance del modelo local de GridMind.'}</p>
        </div>
        <button className="button button-primary" onClick={handleTestReferenceScenario} disabled={testingRef || info?.modelTrained === false}>
          {testingRef ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
          {testingRef ? 'Evaluando…' : 'Probar Escenario de Referencia'}
        </button>
      </div>

      <div className="notice-banner model-disclaimer">
        <AlertTriangle size={18} />
        <span>
          <strong>Modelo entrenado con datos sintéticos generados por el sistema.</strong>{' '}
          No predice fallas de equipos reales; valida el flujo de análisis.
          <br />
          {datasetSize === null
            ? 'El tamaño del dataset sintético no está disponible.'
            : `Dataset sintético: ${datasetSize.toLocaleString('es-CO')} muestras. Las métricas se calcularon sobre el 20 % de prueba (${info.testSamplesCount.toLocaleString('es-CO')} muestras) de ese mismo dataset.`}
        </span>
      </div>
      {info?.trainingError && <div className="notice-banner error-banner"><AlertTriangle size={18} /><span>No se pudo entrenar el modelo: {info.trainingError}</span></div>}
      <section className="stats-grid" aria-label="Métricas del modelo">
        <article className="stat-card"><div className="stat-icon blue"><Cpu size={19} /></div><div className="stat-copy"><span>Precisión</span><strong>{percentage(info?.precision)}</strong><small>Predicciones positivas correctas</small></div></article>
        <article className="stat-card"><div className="stat-icon green"><Award size={19} /></div><div className="stat-copy"><span>Recall</span><strong>{percentage(info?.recall)}</strong><small>Detección de fallas del conjunto de prueba</small></div></article>
        <article className="stat-card"><div className="stat-icon violet"><Activity size={19} /></div><div className="stat-copy"><span>F1-Score</span><strong>{percentage(info?.f1Score)}</strong><small>Balance entre precisión y recall</small></div></article>
        <article className="stat-card"><div className="stat-icon orange"><Sparkles size={19} /></div><div className="stat-copy"><span>ROC-AUC</span><strong>{Number.isFinite(info?.rocAuc) ? info.rocAuc.toFixed(3) : '—'}</strong><small>Discriminación de clases</small></div></article>
      </section>

      {refScenarioResult && (
        <section className="surface-card">
          <div className="card-heading"><div><span className="eyebrow">ESCENARIO DE REFERENCIA</span><h3>Resultado calculado por el modelo</h3></div><CheckCircle2 size={19} className="green-icon" /></div>
          <p className="quiet-note">Entrada fija de prueba; no proviene de sensores.</p>
          <div className="model-result-grid">
            <div><span>Riesgo</span><strong>{refScenarioResult.riskLevel || '—'}</strong></div>
            <div><span>Probabilidad de falla</span><strong>{calculatedProbability}</strong></div>
          </div>
          <div className="model-inputs">
            {Object.entries(refScenarioResult.inputs || {}).map(([name, value]) => <span key={name}>{name}: <strong>{value}</strong></span>)}
          </div>
          {refScenarioResult.recommendation && <div className="recommendation-box"><Sparkles size={16} /><p><strong>Recomendación de referencia</strong><br />{refScenarioResult.recommendation}</p></div>}
        </section>
      )}
      {referenceError && <div className="notice-banner error-banner"><AlertTriangle size={18} /><span>{referenceError}</span></div>}

      <section className="surface-card">
        <div className="card-heading"><div><span className="eyebrow">MODELO DE IA</span><h3>Importancia de variables</h3></div><Sparkles size={19} className="green-icon" /></div>
        {featureChartData.length ? (
          <div className="model-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
              <XAxis type="number" stroke="#8190a3" fontSize={11} unit="%" />
              <YAxis type="category" dataKey="feature" stroke="#8190a3" fontSize={11} width={150} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e8edf3', borderRadius: '8px' }} />
              <Bar dataKey="importance" fill="#3868e8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        ) : <p className="quiet-note">Las importancias de variables no están disponibles.</p>}
      </section>
    </div>
  );
};

export default ModelInfo;
