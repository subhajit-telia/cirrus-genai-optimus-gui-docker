# Stage 1: Build the Ionic app
FROM node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm i -D -E vite
RUN npm install -g @ionic/cli

# Copy the rest of the application code
COPY . .

# Build the Ionic application (assumes a `build` script is defined in package.json)
RUN ionic build --prod

# Verify the build output directory 
RUN ls -la /app/dist

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy built files from the first stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the application
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
