# Build stage
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.template.conf /etc/nginx/templates/default.conf.template

# Set default API URL (can be overridden when running the container)
ENV API_URL=http://localhost:3000

# Expose port 80
EXPOSE 80

# Use nginx-templates to generate config
CMD ["nginx", "-g", "daemon off;"]