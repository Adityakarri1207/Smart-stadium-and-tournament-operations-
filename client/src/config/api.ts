// Central API base URL - reads from env var in production, falls back to localhost in dev
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
