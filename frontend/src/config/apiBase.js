/** URL de base de l'API (sans slash final). Modifier VITE_API_BASE_URL dans frontend/.env */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api'
).replace(/\/$/, '');
