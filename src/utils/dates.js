export const dateLabel = (value) => (value ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin fecha');
