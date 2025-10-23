import axios from 'axios';

// L'URL de base de votre API backend.
// Idéalement, ceci devrait provenir d'une variable d'environnement.
const API_BASE_URL = '/api';

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
