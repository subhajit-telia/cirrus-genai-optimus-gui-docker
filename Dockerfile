# Stage 1: Build the Ionic app
FROM cirrus-docker.jfrog.teliacompany.io/node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
# Increased fetch-timeout to handle slow QEMU-emulated arm64 builds
RUN npm install --production
# Comment out additional npm install, as the previous command should install all dependencies including devDependencies
RUN npm i -D -E vite 
RUN npm install -g @ionic/cli
# Copy the rest of the application code
COPY . .

# Build the Ionic application (assumes a `build` script is defined in package.json)
RUN ionic build --prod

# Verify the build output directory 
RUN ls -la /app/dist

# Stage 2: Serve the app with Nginx
FROM cirrus-docker.jfrog.teliacompany.io/nginx:alpine

# Copy built files from the first stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the NGINX config template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Expose port 80 for the application
EXPOSE 80

# Replace placeholders in the config file with env variables and start NGINX
CMD envsubst '${API_KEY} ${API_ENDPOINT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'