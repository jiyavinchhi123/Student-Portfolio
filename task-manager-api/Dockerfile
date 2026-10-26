# ========================================================
# Dockerfile: Node.js / Express Task Manager Backend
# ========================================================

# Base image: Official lightweight Node.js 18 LTS runtime
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies inside the Linux container
RUN npm install

# Copy backend source code (excluding .dockerignore files)
COPY . .

# Document that the backend listens on port 5000
EXPOSE 5000

# Define entrypoint command to launch the Express API server
CMD ["node", "server.js"]
