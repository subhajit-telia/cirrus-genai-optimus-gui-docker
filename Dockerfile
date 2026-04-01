# Stage 1: Build the Ionic app
# syntax=docker/dockerfile:1.6
FROM cirrus-docker.jfrog.teliacompany.io/node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
# Using BuildKit cache mounts significantly speeds up repeated CI builds.
# Also use `npm ci` for deterministic/fast installs from the lockfile.
# Skip Cypress binary download in CI image build (not needed for compile).
ENV CYPRESS_INSTALL_BINARY=0
RUN --mount=type=cache,target=/root/.npm \
  npm ci --fetch-timeout=600000 --no-audit --no-fund --prefer-offline

# Copy the rest of the application code
COPY . .

# Build the app using the project script (tsc + vite build)
RUN npm run build

# Verify the build output directory 
RUN ls -la /app/dist

# Stage 2: Serve the app with Nginx
FROM cirrus-docker.jfrog.teliacompany.io/nginx:alpine

# Copy built files from the first stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the NGINX config template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Runtime env injection (generates /usr/share/nginx/html/runtime-env.js)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80 for the application
EXPOSE 80

# Generate runtime config + NGINX config, then start NGINX
CMD ["/docker-entrypoint.sh"]