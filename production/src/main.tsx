// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { detectUnknownTenant } from './config/clientConfig';
import { UnknownTenantPage } from './components/UnknownTenantPage';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Élément racine introuvable');

const root = ReactDOM.createRoot(rootElement);

// Sous-domaine inconnu : page dédiée, sans initialiser l'authentification ni l'API
const unknownTenant = detectUnknownTenant(window.location.hostname);

// AuthProvider est monté dans App (sous le store) : ne pas le remonter ici,
// sinon la synchro du compte (GET puis POST /users) part deux fois en parallèle.
root.render(
  unknownTenant ? <UnknownTenantPage tenant={unknownTenant} /> : <App />
);
