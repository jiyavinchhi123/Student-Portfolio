# ========================================================
# Dockerfile: React + Vite Student Portfolio Frontend
# Multi-Stage Build for Optimized Production Delivery
# ========================================================

# Stage 1: Build environment
FROM node:18-alpine AS build

WORKDIR /app

# Copy package manifests first to optimize Docker layer caching
COPY package*.json ./

# Install build dependencies
RUN npm install

# Copy source code (excluding files listed in .dockerignore)
COPY . .

# Build the production bundle into /app/dist
RUN npm run build

# Document application port
EXPOSE 5173

# Serve the production bundle using Vite preview accessible externally (--host 0.0.0.0)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
