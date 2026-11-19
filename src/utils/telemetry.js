export const readingSourceLabel = (source) => {
  if (source === 'HARDWARE') return 'HW';
  if (source === 'SIMULATION' || source === 'SIMULATED') return 'SIM';
  return null;
};

export const recentDataSourceLabel = (source) => {
  if (source === 'SIMULATION' || source === 'SIMULATED') return 'Datos: Simulados';
  if (source === 'HARDWARE') return 'Datos: Hardware';
  if (source === 'MIXED') return 'Datos: Mixtos';
  return 'Datos: Sin lecturas recientes';
};
