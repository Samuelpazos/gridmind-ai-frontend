import React, { useState } from 'react';
import { getDemoReferenceScenario } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, Award, Cpu, Loader2, Play, Sparkles } from 'lucide-react';

const percentile = new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 });
const percentage = (value) => Number.isFinite(value) ? percentile.format(value) : '—';

const metrics = [
  { key: 'precision', title: 'Precisión de las alertas', icon: Cpu, tone: 'blue', detail: 'De los casos que el modelo marcó como falla, cuántos eran fallas en la prueba.' },
  { key: 'recall', title: 'Fallas detectadas (recall)', icon: Award, tone: 'green', detail: 'De todas las fallas incluidas en la prueba, cuántas detectó el modelo.' },
  { key: 'f1Score', title: 'Equilibrio (F1)', icon: Activity, tone: 'violet', detail: 'Combina precisión y detección. Es más alto cuando ambas son buenas.' },
  { key: 'rocAuc', title: 'Separación de casos (ROC-AUC)', icon: Sparkles, tone: 'orange', detail: 'Mide qué tan bien ordena los casos por riesgo. 1 es la mejor separación y 0,5 equivale al azar.' },
];

const inputLabels = { temperatura: 'Temperatura', voltaje: 'Voltaje', corriente: 'Corriente', vibracion: 'Vibración', edad: 'Antigüedad' };
const riskLabels = { LOW: 'Bajo', MEDIUM: 'Medio', HIGH: 'Alto', CRITICAL: 'Crítico' };

export default function ModelInfo({ info }) {
  const [reference, setReference] = useState(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  async function runReference() {
    setTesting(true);
    setError('');
    setReference(null);
    try {
      const response = await getDemoReferenceScenario();
      setReference(response.data);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'No se pudo calcular el ejemplo. Inténtalo de nuevo.');
    } finally {
      setTesting(false);
    }
  }

  const training = info?.trainingSamplesCount;
  const testingSamples = info?.testSamplesCount;
  const datasetSize = Number.isFinite(training) && Number.isFinite(testingSamples) ? training + testingSamples : null;
  const chartData = Object.entries(info?.featureImportances || {}).map(([feature, value]) => ({
    feature, importance: Math.round(value * 100),
  }));

  return (
    <div className="page-stack model-guide">
      <section className="surface-card model-intro" aria-labelledby="model-purpose">
        <div className="card-heading">
          <div>
            <h2 id="model-purpose">¿Qué evalúa GridMind?</h2>
            <p>El modelo supervisado estima el riesgo de falla a partir de temperatura, corriente, voltaje, vibración y antigüedad.</p>
          </div>
          <span className="form-icon"><Cpu size={18} /></span>
        </div>
        <div className="notice-banner model-disclaimer">
          <AlertTriangle size={18} />
          <span>
            <strong>Prueba con datos sintéticos.</strong> Los ejemplos fueron generados por GridMind. Estas métricas aún no validan el desempeño con transformadores reales.
            {datasetSize !== null && <><br />De {decimal.format(datasetSize)} casos, {decimal.format(training)} se usaron para entrenar y {decimal.format(testingSamples)} para evaluar.</>}
          </span>
        </div>
        {info?.trainingError && <p className="form-error" role="alert">No se pudo entrenar el modelo: {info.trainingError}</p>}
      </section>

      <section className="page-stack" aria-labelledby="model-metrics">
        <div className="model-section-title">
          <h3 id="model-metrics">Cómo leer las métricas</h3>
          <p>Resumen del modelo supervisado en los casos reservados para la prueba.</p>
        </div>
        <div className="stats-grid model-metrics">
          {metrics.map(({ key, title, icon: Icon, tone, detail }) => (
            <article className="stat-card" key={key}>
              <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
              <div className="stat-copy">
                <span>{title}</span>
                <strong>{key === 'rocAuc' ? (Number.isFinite(info?.[key]) ? decimal.format(info[key]) : '—') : percentage(info?.[key])}</strong>
                <small>{detail}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card" aria-labelledby="model-example">
        <div className="card-heading model-example-heading">
          <div><h3 id="model-example">Prueba el modelo con un ejemplo</h3><p>Evalúa un caso fijo de prueba. Tus equipos y lecturas quedan intactos.</p></div>
          <button type="button" className="button button-primary" onClick={runReference} disabled={testing || info?.modelTrained === false}>
            {testing ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
            {testing ? 'Calculando…' : 'Evaluar caso de ejemplo'}
          </button>
        </div>
        {info?.modelTrained === false && <p className="quiet-note">El modelo todavía no está disponible para evaluar el caso.</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {reference && (
          <div className="model-example-result" role="status">
            <div className="model-result-grid">
              <div><span>Nivel de riesgo estimado</span><strong>{riskLabels[reference.riskLevel] || '—'}</strong></div>
              <div><span>Probabilidad de falla estimada</span><strong>{percentage(reference.failureProbability)}</strong></div>
            </div>
            <div className="model-inputs">
              {Object.entries(reference.inputs || {}).map(([name, value]) => (
                <span key={name}>{inputLabels[name] || name} <strong>{value}</strong></span>
              ))}
            </div>
            {reference.recommendation && <div className="recommendation-box"><Sparkles size={16} /><p><strong>Recomendación para este ejemplo</strong><br />{reference.recommendation}</p></div>}
          </div>
        )}
      </section>

      <section className="surface-card" aria-labelledby="model-importance">
        <div className="card-heading"><h3 id="model-importance">Qué variables pesan más</h3><Sparkles size={19} className="green-icon" /></div>
        <p className="quiet-note">Una barra más larga indica que esa variable influyó más en el modelo durante el entrenamiento.</p>
        {chartData.length ? (
          <div className="model-chart" aria-label="Importancia relativa de las variables">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />
                <XAxis type="number" stroke="#8190a3" fontSize={11} unit="%" />
                <YAxis type="category" dataKey="feature" stroke="#8190a3" fontSize={11} width={120} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, 'Importancia relativa']} contentStyle={{ backgroundColor: '#fff', borderColor: '#e8edf3', borderRadius: '8px' }} />
                <Bar dataKey="importance" fill="#3868e8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="quiet-note">La importancia de las variables todavía no está disponible.</p>}
      </section>
    </div>
  );
}
