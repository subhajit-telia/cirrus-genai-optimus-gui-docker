# Stage 1: Build the Ionic app
FROM cirrus-docker.jfrog.teliacompany.io/node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies with production flag only
RUN npm install --production

# Install Vite and Ionic CLI as dev dependencies
RUN npm install -D -E vite@5.4.21 @vitejs/plugin-legacy@5.4.1 @vitejs/plugin-react@4.3.1
RUN npm install -g @ionic/cli

# Copy the rest of the application code
COPY . .

# Build the Ionic application
RUN ionic build --prod

# Verify the build output directory 
RUN ls -la /app/dist

# Stage 2: Serve the app with Nginx
FROM cirrus-docker.jfrog.teliacompany.io/nginx:alpine

# Copy built files from the first stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the NGINX config template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Copy entrypoint script to configure runtime environment
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80 for the application
EXPOSE 80

# Set entrypoint to configure environment and start NGINX
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]