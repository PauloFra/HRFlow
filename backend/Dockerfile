# Multi-stage build for HRFlow Backend
FROM node:18-alpine AS base

# Install system dependencies for native modules
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# ================================
# Dependencies stage
# ================================
FROM base AS deps

# Install all dependencies including devDependencies
RUN npm ci --include=dev

# Generate Prisma client
RUN npx prisma generate

# ================================
# Build stage
# ================================
FROM base AS builder

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ================================
# Development stage
# ================================
FROM base AS development

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hrflow

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copy source code and change ownership
COPY --chown=hrflow:nodejs . .

# Create uploads directory
RUN mkdir -p uploads && chown hrflow:nodejs uploads

# Switch to non-root user
USER hrflow

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start development server
CMD ["npm", "run", "dev"]

# ================================
# Production stage
# ================================
FROM node:18-alpine AS production

# Install system dependencies and curl for health checks
RUN apk add --no-cache \
    libc6-compat \
    curl \
    tini

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hrflow

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=hrflow:nodejs /app/dist ./dist
COPY --from=builder --chown=hrflow:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=hrflow:nodejs /app/prisma ./prisma

# Create necessary directories
RUN mkdir -p uploads logs && chown hrflow:nodejs uploads logs

# Switch to non-root user
USER hrflow

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start production server
CMD ["node", "dist/server.js"] 