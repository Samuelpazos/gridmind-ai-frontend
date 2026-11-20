export const errorText = (error) => error?.response?.data?.message || error?.message || 'Ocurrió un error inesperado.';
