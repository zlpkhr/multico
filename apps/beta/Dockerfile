# Use Node.js LTS (Long Term Support) image with alpine for smaller size
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies with specific flags for production
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Set Node.js to run in production mode
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Use non-root user for better security
USER node

# Start the application
CMD ["node", "src/app.js"] 