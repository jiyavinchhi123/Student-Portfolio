# Task Manager RESTful API

A lightweight RESTful backend API designed with Node.js and Express.js, showcasing a robust middleware pipeline, input validation, custom logging, and centralized error handling.

## Table of Contents
1. [Prerequisites & Installation](#prerequisites--installation)
2. [Running the Server](#running-the-server)
3. [API Endpoints Documentation](#api-endpoints-documentation)
4. [Middleware Pipeline Architecture](#middleware-pipeline-architecture)
5. [Key Analysis & Lab Questions Answers](#key-analysis--lab-questions-answers)
6. [In-Memory Caching Architecture & Empirical Evaluation](#in-memory-caching-architecture--empirical-evaluation)
7. [Asynchronous Background Processing (Node.js Native EventEmitter)](#asynchronous-background-processing-nodejs-native-eventemitter)
8. [Docker Containerization & Multi-Service Orchestration](#docker-containerization--multi-service-orchestration)

---

## Prerequisites & Installation

Make sure you have [Node.js](https://nodejs.org/) (version 18 or above) and npm installed.

1. Navigate to the API folder:
   ```bash
   cd task-manager-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## Running the Server

Start the server locally:
```bash
npm start
```
Run automated test suites:
```bash
npm run test:cache   # Caching benchmark suite
npm run test:events  # EventEmitter async non-blocking benchmark suite
```
By default, the server runs on **port 5000** (`http://localhost:5000`).

---

## API Endpoints Documentation

### Tasks Resource (with In-Memory Caching & EventEmitter)

| Method | Endpoint | Description | Status Codes | Event & Cache Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Retrieve all tasks | `200 OK` | Cached in-memory (TTL: 60s, `X-Cache: HIT/MISS`) |
| **GET** | `/tasks/:id` | Retrieve a specific task by ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` | Cached individually (`task_<id>`) |
| **POST** | `/tasks` | Create a new task (body: `title`, `assignedUser`, etc.) | `201 Created`, `400 Bad Request`, `415 Unsupported Media Type` | Invalidates cache; emits `task-created` event asynchronously |
| **PUT** | `/tasks/:id` | Update an existing task properties | `200 OK`, `400 Bad Request`, `404 Not Found`, `415 Unsupported Media Type` | Invalidates `all_tasks` & `task_<id>` |
| **DELETE** | `/tasks/:id` | Delete a task | `200 OK`, `400 Bad Request`, `404 Not Found` | Invalidates cache; emits `task-deleted` event asynchronously |

### Background EventEmitter & Debug Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/tasks/events/log` | Inspect live background notification log feed & timing | `200 OK` |
| **GET** | `/debug/events` | Alias for background EventEmitter audit logs | `200 OK` |
| **POST** | `/debug/events/simulate-error` | Deliberately triggers an error inside an event listener to prove safe error handling | `200 OK` |
| **POST** | `/debug/events/config` | Configure simulated background listener delay (e.g. 2000ms) | `200 OK` |
| **POST** | `/debug/events/clear` | Clear recent in-memory event buffer | `200 OK` |
| **GET** | `/debug/cache` | Inspect cache metrics (hits, misses, hit ratio, active keys) | `200 OK` |
| **GET** | `/tasks/cache/stats` | Alias for cache inspection and performance monitoring | `200 OK` |
| **POST** | `/debug/cache/clear` | Clear/flush in-memory cache for empirical benchmarking | `200 OK` |
| **GET** | `/trigger-error` | Deliberately triggers a server error to test Global Error Handling | `500 Internal Server Error` |

---

## Middleware Pipeline Architecture

Every request flows sequentially through the following pipeline:

```
Request (Client)
  │
  ▼
[CORS Middleware] ───────────────────► Allows front-end connections from Vite
  │
  ▼
[express.json()] ────────────────────► Parses JSON body payloads
  │
  ▼
[Request Logging Middleware] ────────► Logs method, URL, and timestamp
  │
  ▼
[Content-Type Verifier] ─────────────► Rejects POST/PUT if Content-Type isn't application/json (returns 400 or 415)
  │
  ▼
[validateTaskId (Route-Specific)] ────► Checks if req.params.id is a positive integer (returns 400 if invalid)
  │
  ▼
[Route Controllers] ─────────────────► Executes CRUD logic (returns 200, 201, or 404)
  │
  ▼
[404 Route Catch-All] ───────────────► Triggered if route is not defined (returns 404)
  │
  ▼
[Global Error Handler] ──────────────► Catches errors thrown in app (returns 500)
```

---

## Key Analysis & Lab Questions Answers

### 1. Why must the error handling middleware be defined last in the middleware chain?
Express resolves middleware and routes in the exact order they are registered using `app.use()`, `app.get()`, etc. When an error is thrown in a route or a middleware, or when it is passed explicitly via `next(err)`, Express bypasses all remaining regular middleware and goes straight to the next registered error-handling middleware (which is identified by having exactly 4 parameters: `(err, req, res, next)`). 

If the error-handling middleware is defined *before* a route, it is already passed by the time that route is registered. Therefore, when that route throws an error, Express searches for an error handler further down the chain and, finding none, falls back to the default Express HTML error reporter. Hence, error handlers must always be registered **after** all routes and controllers.

### 2. What is the difference between `app.use()` and a route-specific middleware?
- **`app.use()` (Global/Path Middleware):** Registers middleware globally for all incoming HTTP requests (or all requests under a matching path prefix). Examples include `express.json()`, logging middleware, and global error handlers. They run for every request regardless of the specific route method.
- **Route-Specific Middleware:** Passed directly as arguments inside a specific HTTP method route definition (e.g., `app.delete('/tasks/:id', validateTaskId, controller)`). They only run if the incoming request matches both the HTTP method (like DELETE) and the exact path pattern (like `/tasks/:id`). This keeps validations focused and lightweight, avoiding unnecessary code execution on unrelated routes.

### 3. Why is it considered bad practice to send raw error stack traces to the client?
Sending raw error stack traces to clients is a major security risk (Information Disclosure) and results in poor user experience:
1. **Security Vulnerabilities:** Stack traces reveal server-side directory structures, filenames, exact lines of code, database schemas, library/framework versions, and execution context. Attackers can leverage this information to map out target frameworks and search for known zero-day vulnerabilities.
2. **Brittle UX:** Stack traces are hard to read for normal users and lack structure. APIs should always respond with clean, predictable, structured JSON messages containing a client-friendly error message, facilitating robust client-side error handling.

---

## In-Memory Caching Architecture & Empirical Evaluation

### Caching Architecture Diagram

```
GET /tasks (or GET /tasks/:id)
       │
       ▼
[Check node-cache]
  ├── HIT ─────────► Set 'X-Cache: HIT' ──► Return JSON immediately (Memory)
  └── MISS ────────► Set 'X-Cache: MISS' ─► Query MongoDB ──► Store in node-cache ──► Return JSON

POST /tasks, PUT /tasks/:id, DELETE /tasks/:id (Write Operations)
       │
       ▼
[Write to MongoDB] ──► Successful DB Write ──► Invalidate Cache Keys ('all_tasks', 'task_:id')
```

### Measured Response Time Comparison (Empirical Lab Readings)

Measured across 5 repeated requests using the automated benchmark harness (`node test_cache.js`) against live MongoDB:

| Request Sample | Uncached (Direct MongoDB Read) | Cached (`node-cache` In-Memory HIT) | Difference / Reduction |
| :--- | :--- | :--- | :--- |
| **Sample 1** | 46.65 ms | 6.41 ms | -40.24 ms (86.2% faster) |
| **Sample 2** | 21.66 ms | 6.12 ms | -15.54 ms (71.7% faster) |
| **Sample 3** | 10.36 ms | 7.31 ms | -3.05 ms (29.4% faster) |
| **Sample 4** | 7.56 ms | 4.38 ms | -3.18 ms (42.1% faster) |
| **Sample 5** | 9.82 ms | 6.10 ms | -3.72 ms (37.9% faster) |
| **Average** | **19.21 ms** | **6.06 ms** | **⚡ 3.2x faster (68.5% latency reduction)** |
| **Single-Task GET** | 10.73 ms (MISS) | 1.81 ms (HIT) | **⚡ 5.9x faster (83.1% latency reduction)** |

---

## Caching Lab Analysis: Key Questions & Theoretical Answers

### 1. Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
- **Data Correctness & Integrity:** Caching creates a secondary copy of data in fast RAM. Whenever a mutation occurs in the primary store (MongoDB) via `POST` (create), `PUT` (update), or `DELETE` (remove), the cached copy immediately becomes **stale**.
- **Impact of Omitting Invalidation:** If cache invalidation is omitted, read requests within the TTL window continue to receive the outdated RAM snapshot. Users would observe phantom tasks that were deleted, miss newly created tasks, or see obsolete completion statuses. This breaks **read-after-write consistency** and leads to severe data desynchronization between client and server.

### 2. What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
- **Recommended TTL:** A TTL of **60 to 300 seconds** (1–5 minutes) coupled with **active event-driven cache invalidation** on write is optimal for a task management system.
- **The Core Trade-off:**
  - **Short TTL (e.g., 5–15 seconds):** Guarantees high data freshness even if an invalidation trigger fails, but degrades cache hit ratio under intermittent traffic and increases database load.
  - **Long TTL (e.g., 10–60 minutes):** Maximizes hit ratio and protects the database under heavy read spikes, but increases the risk of serving stale data if write invalidation logic fails or external processes modify the database directly.

### 3. Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?
- **Process-Local Memory Limitation:** `node-cache` allocates memory inside the single Node.js V8 process heap (`process.memoryUsage()`). 
- **The Split-Brain Dilemma in Multi-Server Deployments:**
  1. In a production cluster running behind a Load Balancer (e.g., NGINX, AWS ALB) with multiple Node.js instances (Instance A, B, C):
  2. If a client sends `PUT /tasks/123` to **Instance A**, Instance A updates MongoDB and clears *its own* local `node-cache`.
  3. However, **Instance B** and **Instance C** still retain the old task in their separate memory heaps!
  4. Subsequent `GET /tasks` requests routed to Instance B or C will return **stale data**.
- **Production Solution:** Distributed caching stores such as **Redis** or **Memcached**, where all application server instances share a centralized, high-speed in-memory data store.

---

## Asynchronous Background Processing (Node.js Native EventEmitter)

### 1. Architecture & Execution Flow Diagram

```text
Client (Postman / Browser)
         │
         │ 1. POST /tasks (JSON payload)
         ▼
┌─────────────────────────────────┐
│     Express Route Pipeline      │
│  - Parse JSON body              │
│  - Validate schema              │
│  - Save task to MongoDB (await) │
└────────────────┬────────────────┘
                 │
                 ├──► 2. Invalidate In-Memory Cache ('all_tasks')
                 │
                 ├──► 3. API Responds IMMEDIATELY (201 Created)  ⚡ ~20ms
                 │       (Client receives task data without waiting)
                 │
                 ▼
     taskEvents.emit('task-created', taskData)
                 │
                 ▼ (Queued on Node.js Event Loop)
┌────────────────────────────────────────────────────────┐
│              Background Event Listeners                │
│  - Handled asynchronously after response is sent       │
│  - Simulates notification dispatch (2000ms delay)      │
│  - Logs: Task Title, Timestamp, Assigned User          │
│  - Executes without blocking main thread I/O           │
└────────────────────────────────────────────────────────┘
```

### 2. Empirical Execution & Timestamp Evidence (Automated Benchmark)

Verified using `node test_events.js` against the live Node/Express/MongoDB server:

| Execution Point | Recorded Timestamp | Elapsed Delay | Operational State |
| :--- | :--- | :--- | :--- |
| **Client HTTP Request Sent** | `2026-10-26T16:46:41.099Z` | `0 ms` | Client initiates `POST /tasks` |
| **API Response Transmitted (201)** | `2026-10-26T16:46:41.124Z` | `+25.23 ms` | **Client receives 201 Created immediately** |
| **Background Listener Queued** | `2026-10-26T16:46:41.125Z` | `+26.00 ms` | Event received on EventEmitter |
| **Background Notification Complete** | `2026-10-26T16:46:43.130Z` | `+2006 ms` | **Notification finished in background** |

> **Key Takeaway:** The client experienced a total round-trip latency of only **25.23 ms**, while the notification side effect took **2000 ms** to execute in the background. The user was saved nearly 2 seconds of waiting time per task creation!

---

### 3. Key Analysis & Theoretical Answers

#### Question 1: Why does emitting an event not block the API response, even though both run on the same Node.js process?
In Node.js, `taskEvents.emit()` is invoked synchronously to trigger registered callbacks. However, because our listener delegates heavy I/O operations (or artificial delays) through asynchronous APIs like `setTimeout()`, Promise chains, or native I/O workers, Node.js offloads the callback to the **libuv event loop timer queue**. 

Furthermore, because `res.status(201).json(newTask)` is executed **before** or concurrently with asynchronous delegation, the HTTP response headers and JSON payload are immediately written to the OS TCP socket buffer. Express flushes the response to the client immediately, allowing the client to continue without waiting for the background timer/I/O phase to complete.

#### Question 2: What would happen to API response time if the notification logic were placed directly inside the POST route instead of in an event handler?
If the notification dispatch logic (e.g., sending SMTP emails, SMS messages, or webhooks with a 2-second delay) were written directly inside the `POST /tasks` controller:
1. **Severe Latency Spike:** The route handler would have to `await sendNotification()`. The client turnaround latency would jump from **~25 ms to over 2025 ms** (an 80x latency degradation).
2. **Reduced Server Throughput:** The single Node.js thread would hold each HTTP connection open for 2 extra seconds, rapidly exhausting available socket descriptors and memory under high concurrent traffic.
3. **Coupled Failure Domains:** If the notification service timed out or threw an unhandled network error, the entire task creation transaction would fail, even though the task had already been successfully written to MongoDB.

#### Question 3: Why is EventEmitter a reasonable choice for this scale of application, but not for a production system handling millions of events per day?
- **Why it is great for this scale:**
  - Built directly into Node.js core (`events` module) with **zero external dependencies**.
  - Extremely lightweight with negligible RAM overhead.
  - Decouples concerns cleanly within a single monolith application.
- **Why it fails at enterprise scale (Millions of events/day):**
  1. **Volatile & In-Memory (No Persistence):** EventEmitter events live entirely in the Node.js V8 process heap. If the server crashes, restarts, or runs out of memory, all queued and in-flight events are permanently lost with no retry mechanism.
  2. **Single-Process Bound:** EventEmitter cannot broadcast across multiple clustered processes or servers behind a load balancer. If Instance A emits an event, listeners on Instance B will never receive it.
  3. **No Backpressure or Rate Limiting:** A burst of 100,000 requests will emit 100,000 concurrent callbacks on the event loop, causing event loop lag, CPU starvation, and memory exhaustion.
  4. **Production Solution:** Enterprise distributed systems use dedicated persistent message brokers such as **RabbitMQ, Apache Kafka, or Redis Streams / BullMQ**, which provide disk persistence, horizontal scaling, guaranteed at-least-once delivery, dead-letter queues, and consumer worker pools.

---

### 4. Supplementary Solutions Implemented

1. **`task-deleted` Event Listener:**
   - Dedicated listener registered in `listeners.js` that logs a structured deletion audit message including task ID, title, timestamp, and assigned user.
   - Emitted immediately after successful deletion in `DELETE /tasks/:id`.
2. **Safe EventEmitter Error Trap:**
   - In Node.js, emitting an `'error'` event without an active listener throws an unhandled exception that terminates the process.
   - We registered a base error trap: `taskEvents.on('error', (err) => { ... })`.
   - Verified via `POST /debug/events/simulate-error`: The error was safely caught and logged without crashing the Express server.
3. **Simulated 2-Second Delay:**
   - Configurable simulated latency (`simulatedDelayMs = 2000`) inside `listeners.js` demonstrates realistic external notification dispatch without blocking the main thread.

---

## Docker Containerization & Multi-Service Orchestration

The backend REST API is fully containerized using **Docker** and orchestrated alongside the React frontend and MongoDB database using **Docker Compose**.

### Backend Dockerfile (`task-manager-api/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Single-Command Orchestration
From the workspace root directory:
```bash
# Build images and start all 3 services (frontend, backend, mongodb)
docker compose up --build

# Run in background (detached mode)
docker compose up --build -d

# Stop all services
docker compose down
```

### Inter-Container Networking
Inside Docker Compose, the backend connects to MongoDB using the service name as the hostname:
```env
MONGO_URI=mongodb://mongodb:27017/taskmanager
```
For complete architectural details, layer caching strategies, and answers to theoretical questions, see the full report: [DOCKER_CONTAINERIZATION_REPORT.md](file:///d:/Portfolio/DOCKER_CONTAINERIZATION_REPORT.md).



