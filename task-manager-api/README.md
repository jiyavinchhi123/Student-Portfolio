# Task Manager RESTful API

A lightweight RESTful backend API designed with Node.js and Express.js, showcasing a robust middleware pipeline, input validation, custom logging, and centralized error handling.

## Table of Contents
1. [Prerequisites & Installation](#prerequisites--installation)
2. [Running the Server](#running-the-server)
3. [API Endpoints Documentation](#api-endpoints-documentation)
4. [Middleware Pipeline Architecture](#middleware-pipeline-architecture)
5. [Key Analysis & Lab Questions Answers](#key-analysis--lab-questions-answers)

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
By default, the server runs on **port 5000** (`http://localhost:5000`).

---

## API Endpoints Documentation

### Tasks Resource (with In-Memory Caching)

| Method | Endpoint | Description | Status Codes | Cache Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Retrieve all tasks | `200 OK` | Cached in-memory (TTL: 60s, `X-Cache: HIT/MISS`) |
| **GET** | `/tasks/:id` | Retrieve a specific task by ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` | Cached individually (`task_<id>`) |
| **POST** | `/tasks` | Create a new task (body requires `title`) | `201 Created`, `400 Bad Request`, `415 Unsupported Media Type` | Invalidates `all_tasks` cache |
| **PUT** | `/tasks/:id` | Update an existing task properties | `200 OK`, `400 Bad Request`, `404 Not Found`, `415 Unsupported Media Type` | Invalidates `all_tasks` & `task_<id>` |
| **DELETE** | `/tasks/:id` | Delete a task | `200 OK`, `400 Bad Request`, `404 Not Found` | Invalidates `all_tasks` & `task_<id>` |

### Cache & Debug Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
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

