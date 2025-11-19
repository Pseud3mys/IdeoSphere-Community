// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/authContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Élément racine introuvable');

const root = ReactDOM.createRoot(rootElement);

root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
);