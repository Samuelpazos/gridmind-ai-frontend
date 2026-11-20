export const simulationNumber = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
export const simulationMeasurement = (value, unit) =>
  Number.isFinite(value) ? `${simulationNumber.format(value)} ${unit}` : 'Sin lectura';
