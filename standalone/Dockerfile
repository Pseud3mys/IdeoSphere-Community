# ----- Stage 1: Build -----
# Utiliser une image Node.js légère (version Alpine) comme base
FROM node:18-alpine AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Lancer le build (Vite va générer le dossier /build, comme vu dans votre vite.config.ts)
RUN npm run build

# ----- Stage 2: Serve -----
# Utiliser une image Nginx légère
FROM nginx:1.25-alpine

# Copier les fichiers buildés du stage "builder" vers le dossier par défaut de Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copier votre configuration Nginx personnalisée (voir étape suivante)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80 (port HTTP standard)
EXPOSE 80

# Commande pour démarrer Nginx quand le conteneur se lance
CMD ["nginx", "-g", "daemon off;"]