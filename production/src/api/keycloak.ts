import Keycloak from 'keycloak-js';

// On récupère les variables d'env, avec des valeurs par défaut pour le dév local
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'ideosphere',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'ideosphere-front'
};

class KeycloakService {
  private static instance: Keycloak;

  public static getInstance(): Keycloak {
    if (!KeycloakService.instance) {
      KeycloakService.instance = new Keycloak(keycloakConfig);
    }
    return KeycloakService.instance;
  }
}

export const keycloak = KeycloakService.getInstance();

/**
 * Helper pour récupérer le token sans passer par authService.
 * Permet de briser les dépendances circulaires avec apiClient.
 */
export function getToken(): string | undefined {
  return keycloak.token;
}