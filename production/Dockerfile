# frontend/Dockerfile

# --- Étape 1: Build de l'application ---
# On utilise une image Node.js officielle pour construire le projet
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances et les installer
# On les copie en premier pour profiter du cache Docker si elles ne changent pas
COPY package.json package-lock.json* ./
RUN npm install

# Copier le reste du code source de l'application
COPY . .

# Lancer le script de build de Vite
RUN npm run build

# --- Étape 2: Service de production ---
# On utilise une image Nginx légère pour servir les fichiers statiques
FROM nginx:stable-alpine

# Copier les fichiers construits depuis l'étape "build"
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration personnalisée de Nginx
# Ce fichier gérera le routage de React et le proxy vers le backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80 (port par défaut de Nginx)
EXPOSE 80

# Commande pour démarrer Nginx au premier plan
CMD ["nginx", "-g", "daemon off;"]