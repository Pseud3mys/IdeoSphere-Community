import axios from 'axios';

// L'URL de base de votre API backend.
// api/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Fallback au cas où

/**
 * Instance Axios pré-configurée pour toutes les requêtes API.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
