# Stage 1: Build the Ionic app
FROM cirrus-docker.jfrog.teliacompany.io/node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN npm install -D -E vite@5.4.21 @vitejs/plugin-legacy@5.4.1 @vitejs/plugin-react@4.3.1
RUN npm install -g @ionic/cli

COPY . .
RUN ionic build --prod
RUN ls -la /app/dist

# Stage 2: Serve the app with Nginx
FROM cirrus-docker.jfrog.teliacompany.io/nginx:alpine

# Copy built files from the first stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy template files for runtime configuration
COPY public/config.template.js /etc/nginx/templates/config.js.template

# Copy config script and NGINX config template
COPY entrypoint.sh /entrypoint.sh
COPY nginx.conf.template /etc/nginx/nginx.conf.template

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]