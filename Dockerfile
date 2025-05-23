# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install global dependencies if any (e.g., for specific package managers)
# RUN npm install -g pnpm

# ---- Dependencies Stage ----
FROM base AS deps
COPY package.json ./
COPY package-lock.json* ./
RUN npm ci --omit=dev

COPY backend/package.json ./backend/
COPY backend/package-lock.json* ./backend/
RUN cd backend && npm ci --omit=dev

COPY frontend/package.json ./frontend/
COPY frontend/package-lock.json* ./frontend/
RUN cd frontend && npm ci --omit=dev


# ---- Backend Build Stage ----
FROM base AS backend-builder
COPY --from=deps /app/node_modules ./node_modules/
COPY --from=deps /app/backend/node_modules ./backend/node_modules/
COPY backend ./backend/
RUN cd backend && npm run build


# ---- Frontend Build Stage ----
FROM base AS frontend-builder
ENV NODE_OPTIONS="--max-old-space-size=4096"
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules/
COPY frontend ./frontend/
# Ensure NEXT_PUBLIC_API_URL is available at build time if needed for static export or specific build logic
# For a dynamic SSR/ISR app served by the backend, this might not be strictly needed at frontend build time
# ARG NEXT_PUBLIC_API_URL_ARG=/api
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL_ARG
RUN cd frontend && npm run build # This should produce a standalone build if next.config.js has output: 'standalone'


# ---- Production Stage ----
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/package.json ./
COPY --from=deps /app/package-lock.json* ./
COPY --from=deps /app/node_modules ./node_modules/

COPY run.js .
# COPY .env . # Optional: only if .env contains non-secret defaults and exists in build context

COPY --from=backend-builder /app/backend/dist ./backend/dist/
COPY --from=deps /app/backend/node_modules ./backend/node_modules/ # Runtime backend deps
COPY --from=backend-builder /app/backend/package.json ./backend/package.json # Use backend-builder for the potentially modified package.json
COPY --from=backend-builder /app/backend/config ./backend/config/

COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/.next/standalone/
COPY --from=frontend-builder /app/frontend/public ./frontend/public/

# Expose port (ensure this matches what your app listens on, e.g., from process.env.PORT in run.js)
EXPOSE 10000

# Healthcheck (optional, but good practice)
# Update path and port as necessary
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#   CMD curl -f http://localhost:10000/api/health || exit 1

# Start command
CMD ["node", "run.js"] 