// API Configuration
export const API_URL = 'https://mhbodhi.medtalent.co/api';

// Ensure URL ends with a slash
export const getApiUrl = () => API_URL.endsWith('/') ? API_URL : `${API_URL}/`; 