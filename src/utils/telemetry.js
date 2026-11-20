export const readingSourceLabel = (source, expanded = false) => {
  if (source === 'HARDWARE_DEMO') return 'Dato de demostración';
  if (source === 'HARDWARE') return expanded ? 'Hardware' : 'HW';
  if (source === 'SIMULATION' || source === 'SIMULATED') return expanded ? 'Simulación' : 'SIM';
  return null;
};

export const recentDataSourceLabel = (source) => {
  if (source === 'SIMULATION' || source === 'SIMULATED') return 'Datos: Simulados';
  if (source === 'HARDWARE') return 'Datos: Hardware';
  if (source === 'MIXED') return 'Datos: Mixtos';
  return 'Datos: Sin lecturas recientes';
};
