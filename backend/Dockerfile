FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Setup environment
ENV NODE_ENV=production
ENV PORT=10000

# Expose API port
EXPOSE 10000

# Start the server
CMD ["node", "server.js"] 