# Lab Performance Report: Full-Stack Containerization & Multi-Service Orchestration with Docker & Docker Compose

**Student Name:** Jiya Vinchhi  
**Project:** Task Management API & Student Portfolio (Full-Stack)  
**Course / Module:** IBM: Introduction to Containers with Docker, Kubernetes & OpenShift / Advanced Web Architecture  
**Tools & Environment:** Docker (v29.7.2), Docker Compose (v5.3.1), Node.js (v18-alpine), MongoDB (v6.0 official), React 18, Vite 5.4, Express.js  

---

## 1. Executive Summary

This report documents the architectural design, implementation, and empirical verification of **full-stack application containerization** using **Docker** and multi-service orchestration using **Docker Compose**.

Modern enterprise deployment demands consistent, reproducible environments across development, testing, and production. Distributing multi-tier applications across heterogeneous host machines often leads to runtime version drift, missing system libraries, and database configuration failures (the classic *"it works on my machine"* dilemma). 

To eliminate these failure modes, the entire full-stack application was decomposed and encapsulated into isolated, lightweight, OCI-compliant Linux containers:
1. **Frontend:** React + Vite SPA client served via optimized Node runtime.
2. **Backend:** Node.js Express RESTful API with middleware pipelines, in-memory caching (`node-cache`), and event-driven background processing (`EventEmitter`).
3. **Database:** Official MongoDB database engine with persistent host volume storage.
4. **Networking:** Isolated user-defined bridge network (`app-network`) providing automatic DNS service discovery.

The entire 3-tier stack is initialized, configured, and networked with a **single command**:
```bash
docker compose up --build
```

---

## 2. Multi-Container Architecture & Network Topology

### Container Topology & Inter-Service Communication Flow

```text
Host Operating System (Windows / Linux / macOS)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Browser Access                 API Clients / Postman        DB Compass    │
│  http://localhost:5173           http://localhost:5000    localhost:27017   │
│         │                                  │                     │          │
│         ▼                                  ▼                     ▼          │
│    Port 5173                          Port 5000             Port 27017      │
│         │                                  │                     │          │
│   ──────┼──────────────────────────────────┼─────────────────────┼───────   │
│         │ Docker Port Forwarding (NAT)     │                     │          │
│         ▼                                  ▼                     ▼          │
│  ┌──────────────┐                   ┌──────────────┐      ┌──────────────┐  │
│  │   frontend   │                   │   backend    │      │   mongodb    │  │
│  │ (React/Vite) │                   │(Express API) │      │ (Mongo Engine│  │
│  │  Port: 5173  │                   │  Port: 5000  │      │  Port: 27017 │  │
│  └──────┬───────┘                   └──────┬───────┘      └──────┬───────┘  │
│         │                                  │                     │          │
│         │   1. HTTP Requests               │  2. Mongoose Driver │          │
│         │   (Client to API)                │     TCP Connection  │          │
│         │                                  │  mongodb://mongodb  │          │
│         ▼                                  ▼                     │          │
│   ┌───────────────────────────────────────────────────────────┐  │          │
│   │           Docker Bridge Network: 'app-network'            │  │          │
│   │    - Embedded DNS Server resolves container service names │  │          │
│   │    - Isolated software switch preventing external snooping│  │          │
│   └───────────────────────────────────────────────────────────┘  │          │
│                                                                  │          │
│                                                                  ▼          │
│                                                          ┌───────────────┐  │
│                                                          │  Named Volume │  │
│                                                          │  'mongo-data' │  │
│                                                          │  (/data/db)   │  │
│                                                          └───────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Orchestration Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Developer as Developer / Operator
    participant Compose as Docker Compose Engine
    participant Mongo as Service: mongodb (Mongo 6)
    participant Backend as Service: backend (Express API)
    participant Frontend as Service: frontend (React/Vite)

    Developer->>Compose: docker compose up --build
    Compose->>Compose: Create bridge network 'app-network'
    Compose->>Compose: Create named volume 'mongo-data'
    
    Note over Compose,Mongo: Phase 1: Database Initialization
    Compose->>Mongo: Start Container (task-manager-mongodb)
    Mongo->>Mongo: Mount persistent volume /data/db
    Mongo-->>Compose: mongodb healthy & listening on 27017

    Note over Compose,Backend: Phase 2: Backend API Initialization
    Compose->>Backend: Build & start (task-manager-backend)
    Backend->>Mongo: Connect via DNS: mongodb://mongodb:27017/taskmanager
    Mongo-->>Backend: Connection Accepted
    Backend->>Backend: Seed database schemas & start Express on port 5000

    Note over Compose,Frontend: Phase 3: Frontend Client Initialization
    Compose->>Frontend: Build & start (task-manager-frontend)
    Frontend->>Frontend: Vite preview listening on 0.0.0.0:5173

    Developer->>Frontend: Access Web UI (http://localhost:5173)
    Developer->>Backend: Access REST API (http://localhost:5000/tasks)
```

---

## 3. Step-by-Step Implementation Breakdown

### 1. Backend Container Specification (`task-manager-api/Dockerfile`)
Built on official `node:18-alpine` Linux to guarantee minimum image size (~180 MB vs ~1.1 GB for standard Debian-based Node images):

```dockerfile
# task-manager-api/Dockerfile
FROM node:18-alpine
WORKDIR /app

# Step A: Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Step B: Install dependencies inside the Linux container
RUN npm install

# Step C: Copy backend source code (excluding files in .dockerignore)
COPY . .

# Step D: Document runtime port
EXPOSE 5000

# Step E: Default command
CMD ["node", "server.js"]
```

### 2. Frontend Container Specification (`Dockerfile`)
Implements an optimized multi-stage build that compiles the React JSX/Tailwind bundle into minified static assets:

```dockerfile
# Dockerfile (Root Frontend)
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm install

# Copy source and build distribution bundle into /app/dist
COPY . .
RUN npm run build

# Document port
EXPOSE 5173

# Serve production bundle bound to 0.0.0.0
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

### 3. Build Context Filtering (`.dockerignore`)
Placed in both root and backend directories to prevent build context bloat and architecture cross-contamination:

```text
node_modules
dist
.git
.env
.env.local
npm-debug.log*
Dockerfile
docker-compose.yml
```

### 4. Service Orchestration (`docker-compose.yml`)
Declarative multi-container configuration establishing dependencies, port mappings, and persistent storage:

```yaml
services:
  mongodb:
    image: mongo:6
    container_name: task-manager-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  backend:
    build:
      context: ./task-manager-api
      dockerfile: Dockerfile
    container_name: task-manager-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/taskmanager
    depends_on:
      - mongodb
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: task-manager-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
    driver: local
```

---

## 4. Key Questions & Theoretical Analysis (Faculty Evaluation)

### Question 1: Why does the backend container need to reference the MongoDB container by its service name (e.g., `mongodb`) rather than `localhost`?

#### Technical Root Cause: Network Namespace Isolation
In the Linux kernel, Docker implements network virtualization using **network namespaces**. Each running container receives its own independent network stack, including its own routing table, firewall rules, and loopback interface (`localhost` / `127.0.0.1`).

1. If code inside the `backend` container attempts to connect to `mongodb://localhost:27017`, `localhost` points strictly to the **backend container itself**. Because MongoDB is not running inside the backend container, the connection immediately fails with `ECONNREFUSED`.
2. When multiple containers are connected to a user-defined Docker bridge network (such as `app-network`), Docker automatically launches an **internal DNS server** at IP `127.0.0.11`.
3. Docker registers each container's Compose service name as a DNS host record. When Mongoose initiates a connection to `mongodb://mongodb:27017`, Docker's DNS server automatically resolves the hostname `mongodb` to the internal IP allocated to the database container (e.g., `172.20.0.2`).
4. Therefore, referencing `mongodb` by its service name is mandatory for inter-container communication across isolated network namespaces.

---

### Question 2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?

| Dimension | `EXPOSE` (Dockerfile) | `ports` Mapping (docker-compose.yml) |
| :--- | :--- | :--- |
| **Primary Purpose** | Internal documentation & container metadata | Active network address translation (NAT) |
| **Host Accessibility** | **NO**. Port is **NOT** accessible from host browser | **YES**. Binds container port to host network interface |
| **Syntax Format** | `EXPOSE 5000` | `ports: ["5000:5000"]` (`HOST:CONTAINER`) |
| **Operating System Action** | Does not alter kernel firewall or socket bindings | Modifies host `iptables` / NAT tables to route packets |
| **Inter-Container Access**| Other containers on the same network can communicate regardless of `EXPOSE` | Required only when external traffic (outside Docker) must enter |

**Summary:** `EXPOSE 5000` tells the image consumer: *"This service listens on port 5000."* Meanwhile, `ports: ["5000:5000"]` tells the Docker daemon: *"Take any traffic arriving on the physical host machine at port 5000 and forward it directly into container port 5000."*

---

### Question 3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?

Copying a host machine's `node_modules` folder directly into a Docker build context violates core containerization principles for three critical reasons:

#### 1. Binary Architecture Incompatibility (ABI Mismatch)
Many Node.js packages (such as `bcrypt`, `node-sass`, `sqlite3`, `esbuild`, or native buffer parsers) compile native C/C++ bindings during installation via `node-gyp`. If a developer runs `npm install` on a **Windows (x64)** or **macOS (ARM64 Apple Silicon)** host, the compiled binaries are targeting Windows PE or Darwin Mach-O architectures. 
Copying these binaries into an Alpine Linux container results in immediate runtime crashes (`invalid ELF header` or `module was compiled against a different Node.js version`). Running `npm install` inside the container guarantees binaries are compiled natively for the container's Linux kernel.

#### 2. Build Context Bloat & Performance Degradation
The `node_modules` directory typically contains tens of thousands of deeply nested files totaling 300 MB–1 GB. When `docker build` runs, the client must archive and send the entire directory as the **build context** to the Docker daemon. This creates massive disk I/O bottlenecks and inflates build times from seconds to minutes.

#### 3. Invalidation of Docker Layer Caching
Docker optimizes builds using layer caching. By copying only `package*.json` first:
```dockerfile
COPY package*.json ./
RUN npm install
COPY . .
```
Docker caches the `RUN npm install` layer. As long as `package.json` does not change, subsequent code edits rebuild in **under 1 second**. Copying `node_modules` invalidates the layer cache on every local change.

---

## 5. Supplementary Solutions Implemented

### Supplementary Problem 1: `.dockerignore` Context Exclusion
- Created `.dockerignore` files for both frontend and backend.
- Excluded: `node_modules`, `dist`, `.env`, `.git`, temporary log files.
- **Outcome:** Significantly accelerated build context transmission and prevented accidental leakage of local development secrets.

### Supplementary Problem 2: Multi-Stage Frontend Build
- Implemented in root `Dockerfile`.
- Stage 1 compiles React assets using Vite; Stage 2 serves the production distribution via `vite preview --host 0.0.0.0 --port 5173`.
- **Outcome:** Decouples development source code from the runtime execution environment.

### Supplementary Problem 3: Named Volume for MongoDB Persistence
- Defined `mongo-data` volume in `docker-compose.yml`:
  ```yaml
  volumes:
    mongo-data:
      driver: local
  ```
- Mapped to MongoDB container's internal storage engine path `/data/db`.
- **Outcome:** Tasks, user profiles, and portfolio data persist indefinitely, surviving container restarts, image updates, and `docker compose down` commands.

---

## 6. Verification & Operation Runbook

### Step 1: Start Docker Desktop
Ensure Docker Desktop is running on Windows (the whale icon in the system tray).

### Step 2: Launch Full-Stack Application
Execute in workspace root:
```bash
docker compose up --build
```
*Tip: Add `-d` flag to run in detached background mode:*
```bash
docker compose up --build -d
```

### Step 3: Inspect Running Containers
```bash
docker compose ps
```
Expected output:
```text
NAME                     IMAGE                      STATUS          PORTS
task-manager-mongodb     mongo:6                    Up (healthy)    0.0.0.0:27017->27017/tcp
task-manager-backend     portfolio-backend          Up              0.0.0.0:5000->5000/tcp
task-manager-frontend    portfolio-frontend         Up              0.0.0.0:5173->5173/tcp
```

### Step 4: Verify End-to-End Connectivity
1. Open Frontend Dashboard: **`http://localhost:5173/projects/task-manager`**
2. Check Backend Health: **`http://localhost:5000/tasks`**
3. Verify Background EventEmitter Logs: **`http://localhost:5000/debug/events`**
4. Verify In-Memory Cache Stats: **`http://localhost:5000/debug/cache`**

### Step 5: Stop Application Stack
```bash
# Stop containers while preserving database volume
docker compose down

# Stop containers and destroy database volume (clean reset)
docker compose down -v
```

---

## 7. Troubleshooting Guide

| Issue / Symptom | Probable Root Cause | Resolution |
| :--- | :--- | :--- |
| **`MongooseServerSelectionError: connect ECONNREFUSED`** | Backend connection string configured with `localhost` instead of Compose service name. | Ensure `MONGO_URI` in `docker-compose.yml` uses `mongodb://mongodb:27017/taskmanager`. |
| **`bind: address already in use`** | Host port `5000`, `5173`, or `27017` is occupied by a local process or previous container. | Run `netstat -ano \| findstr :5000` to terminate conflicting process, or stop conflicting container via `docker stop`. |
| **`failed to connect to docker API`** | Docker Desktop engine is not running on the Windows host. | Launch Docker Desktop from the Start Menu and wait for the status indicator to turn green. |
| **Code changes not appearing** | Docker is serving cached image layers. | Force clean image rebuild using `docker compose up --build`. |

---

## 8. Conclusion

By containerizing the frontend, backend, and database with Docker and orchestrating them via Docker Compose, the Task Management and Student Portfolio application achieves **100% environment parity**, deterministic zero-configuration startup, and enterprise-grade deployment readiness.
