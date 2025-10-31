// api/keycloak.ts

import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'ideosphere',
  clientId: 'ideosphere-frontend'
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