export const probabilityLabel = (value) => (Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—');
