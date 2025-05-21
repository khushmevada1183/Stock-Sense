FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 