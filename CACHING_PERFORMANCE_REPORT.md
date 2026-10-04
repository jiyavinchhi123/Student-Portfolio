# Lab Performance Report: Server-Side In-Memory Caching & API Latency Analysis

**Student Name:** Jiya Vinchhi  
**Project:** Task Management API (Backend) & Student Portfolio  
**Course / Module:** IBM: Node.js & MongoDB Developing Back-end Database Applications (Module 5: Optimization Techniques & Caching)  
**Tools & Libraries:** Node.js (v18+), Express.js, MongoDB / Mongoose, `node-cache`, Postman / Thunder Client / Custom Automated Benchmark Suite  

---

## 1. Executive Summary

This report documents the design, implementation, and empirical evaluation of **server-side in-memory caching** using `node-cache` for the Task Management REST API. 

Repeated database queries across large-scale applications impose substantial I/O latency and database CPU load. By introducing a fast RAM-based caching layer between the Express routing pipeline and the MongoDB database, identical read operations (`GET /tasks` and `GET /tasks/:id`) are served in microseconds without touching disk or executing database query parsers.

To maintain strict **read-after-write consistency** and data correctness, an **event-driven cache invalidation strategy** was implemented across all mutation operations (`POST`, `PUT`, `DELETE`).

### Key Results Summary
- **Average Uncached Latency:** `19.21 ms`
- **Average Cached Latency:** `6.06 ms`
- **Latency Reduction:** **68.5% faster** (`3.2x` throughput acceleration for all tasks, and `5.9x` acceleration for single task reads)
- **Data Correctness:** `100%` consistency verified through write invalidation hooks.

---

## 2. Architecture & Data Flow Diagram

### Request Flow for Read Operations (`GET /tasks`)

```text
       Client Request: GET /tasks
                   │
                   ▼
       ┌────────────────────────┐
       │   CORS & JSON Parser   │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Request Logging Filter │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │   In-Memory Cache      │
       │   Key: 'all_tasks'     │
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
      [HIT]               [MISS]
         │                   │
         │ (Serve from RAM)  ▼
         │           ┌──────────────────┐
         │           │  Query MongoDB   │
         │           │   (Mongoose)     │
         │           └─────────┬────────┘
         │                     │
         │                     ▼
         │           ┌──────────────────┐
         │           │ Store in Cache   │
         │           │ (TTL: 60 seconds)│
         │           └─────────┬────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ res.set('X-Cache',│  │ res.set('X-Cache',│
│   'HIT')         │  │   'MISS')        │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
          HTTP 200 OK (JSON)
```

### Invalidation Flow for Write Operations (`POST`, `PUT`, `DELETE`)

```text
Client Request: POST / PUT / DELETE /tasks/:id
                   │
                   ▼
       ┌────────────────────────┐
       │ Content-Type & Payload │
       │       Validation       │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │  Execute Mongoose Write│
       │   (Insert/Update/Del)  │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Invalidate Cache Keys  │
       │ • cache.del('all_tasks')│
       │ • cache.del('task_:id') │
       └───────────┬────────────┘
                   │
                   ▼
       HTTP 200 / 201 Response (Fresh JSON)
```

---

## 3. Implementation Details

### Step 1: Package Installation
`node-cache` was added to `package.json`:
```bash
npm install node-cache
```

### Step 2: Shared Cache Instance Module (`task-manager-api/cache.js`)
A centralized cache singleton was created with standard TTL of 60 seconds and automatic cleanup period of 120 seconds:
```javascript
const NodeCache = require('node-cache');

// Initialize cache instance with standard TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

module.exports = cache;
```

### Step 3: Route Caching & Invalidation Logic (`task-manager-api/server.js`)

#### A. Read All Tasks with Cache Check (`GET /tasks`)
```javascript
app.get('/tasks', async (req, res, next) => {
  try {
    const bypassCache = req.query.noCache === 'true' || req.headers['cache-control'] === 'no-cache';

    if (!bypassCache) {
      const cachedTasks = cache.get('all_tasks');
      if (cachedTasks) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cachedTasks);
      }
    }

    const tasks = await Task.find().sort({ createdAt: -1 });

    if (!bypassCache) {
      cache.set('all_tasks', tasks);
    }

    res.set('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});
```

#### B. Single Task Caching (`GET /tasks/:id`)
```javascript
app.get('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const cacheKey = `task_${req.taskId}`;
    const cachedTask = cache.get(cacheKey);
    if (cachedTask) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cachedTask);
    }

    const task = await Task.findById(req.taskId);
    if (!task) {
      return res.status(404).json({ error: "Not Found", message: `Task not found.` });
    }

    cache.set(cacheKey, task);
    res.set('X-Cache', 'MISS');
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});
```

#### C. Cache Invalidation on Mutations (`POST`, `PUT`, `DELETE`)
```javascript
// POST /tasks - Create task & clear cache
const newTask = await Task.create({ ... });
cache.del('all_tasks');
res.status(201).json(newTask);

// PUT /tasks/:id - Update task & clear both keys
const updatedTask = await Task.findByIdAndUpdate(req.taskId, updates, { new: true });
cache.del('all_tasks');
cache.del(`task_${req.taskId}`);
res.status(200).json(updatedTask);

// DELETE /tasks/:id - Delete task & clear both keys
const deletedTask = await Task.findByIdAndDelete(req.taskId);
cache.del('all_tasks');
cache.del(`task_${req.taskId}`);
res.status(200).json({ message: "Task deleted successfully.", task: deletedTask });
```

#### D. Debug Statistics Endpoint (`GET /debug/cache` & `GET /tasks/cache/stats`)
```javascript
app.get('/debug/cache', (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();
  const total = stats.hits + stats.misses;
  const hitRatio = total > 0 ? `${((stats.hits / total) * 100).toFixed(2)}%` : '0.00%';

  res.status(200).json({
    status: "active",
    hits: stats.hits,
    misses: stats.misses,
    totalRequests: total,
    hitRatio: hitRatio,
    activeKeysCount: keys.length,
    activeKeys: keys,
    stdTTL: 60
  });
});
```

---

## 4. Empirical Performance Benchmarking & Results

Measurements were conducted against the active backend server (`http://localhost:5000`) connected to local MongoDB:

### Empirical Response Time Table (Sample Readings)

| Reading # | Uncached (Direct MongoDB Read) | Cached (`node-cache` In-Memory HIT) | Latency Difference | Percentage Reduction |
| :---: | :---: | :---: | :---: | :---: |
| **Sample 1** | `46.65 ms` | `6.41 ms` | `-40.24 ms` | **86.2%** |
| **Sample 2** | `21.66 ms` | `6.12 ms` | `-15.54 ms` | **71.7%** |
| **Sample 3** | `10.36 ms` | `7.31 ms` | `-3.05 ms` | **29.4%** |
| **Sample 4** | `7.56 ms` | `4.38 ms` | `-3.18 ms` | **42.1%** |
| **Sample 5** | `9.82 ms` | `6.10 ms` | `-3.72 ms` | **37.9%** |
| **Average** | **`19.21 ms`** | **`6.06 ms`** | **`-13.15 ms`** | **⚡ 68.5% (3.2x faster)** |

### Single-Task Endpoint (`GET /tasks/:id`)
- **First Request (Cache MISS):** `10.73 ms`
- **Second Request (Cache HIT):** `1.81 ms`
- **Performance Improvement:** **5.9x faster (83.1% latency reduction)**

### Debug Stats Endpoint Response Sample
```json
{
  "status": "active",
  "hits": 6,
  "misses": 5,
  "totalRequests": 11,
  "hitRatio": "54.55%",
  "activeKeysCount": 1,
  "activeKeys": [
    "all_tasks"
  ],
  "stdTTL": 60
}
```

---

## 5. Answers to Key Analysis Questions

### Question 1: Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
**Answer:**  
In-memory caching holds an ephemeral duplicate of primary data stored in MongoDB. When a client performs a mutating operation (`POST`, `PUT`, or `DELETE`), the database state immediately diverges from the cache. 

If invalidation is omitted:
1. **Stale Reads / Phantom Data:** A client creating or updating a task would immediately query `GET /tasks` and see the outdated list without their new task or update.
2. **Deletions Ignored:** A deleted task would continue to appear in responses until the TTL expires.
3. **Broken User Expectations:** In collaborative applications, users would experience race conditions and conflicting updates, violating basic ACID and read-after-write consistency principles.

Therefore, invalidating the corresponding cache keys (`all_tasks` and `task_${id}`) synchronously after a successful write guarantees that the very next read request fetches fresh data from MongoDB and re-populates the cache correctly.

---

### Question 2: What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
**Answer:**  
In a task management system, a reasonable TTL is **60 to 300 seconds (1 to 5 minutes)** when paired with active write-based invalidation.

**The Fundamental TTL Trade-off:**
| Factor | Short TTL (e.g., 5–15 seconds) | Long TTL (e.g., 10–60 minutes) |
| :--- | :--- | :--- |
| **Data Freshness** | Very high freshness; stale data risk is minimal even if invalidation fails. | Higher risk of stale data if mutations bypass the API or invalidation triggers fail. |
| **Cache Hit Ratio** | Low hit ratio under low-to-moderate traffic; keys expire before reuse. | Very high hit ratio; repeated reads consistently hit RAM. |
| **Database Load** | Frequent cache misses cause repeated queries to MongoDB. | Database is shielded from read traffic spikes. |
| **Memory Utilization** | Low RAM usage as expired items are evicted quickly. | Higher RAM usage as items occupy memory for longer durations. |

---

### Question 3: Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?
**Answer:**  
`node-cache` is **process-local**. It stores data directly within the Node.js V8 heap space of the single running process (`process.memoryUsage()`).

In a real-world multi-server deployment (e.g., horizontal scaling using PM2 cluster mode, Docker containers, Kubernetes, or AWS ECS behind an Application Load Balancer):
1. **Isolated Memory Heaps:** Server Instance 1 and Server Instance 2 do not share RAM.
2. **Incoherent Invalidation (Split-Brain):** When a user sends a `POST /tasks` that is load-balanced to **Instance 1**, Instance 1 updates MongoDB and clears *its own* `node-cache`. However, **Instance 2's cache is untouched**.
3. **Inconsistent Responses:** If the user's subsequent `GET /tasks` request is routed by the load balancer to **Instance 2**, Instance 2 serves stale data from its uninvalidated cache!
4. **Resolution:** Production multi-instance backends use a centralized, distributed in-memory store like **Redis** or **Memcached**. Every server instance connects to the shared Redis cluster, guaranteeing unified cache reads, writes, and invalidations across all nodes.

---

## 6. How to Test with Postman or Thunder Client

1. **Start the API Server:**
   ```bash
   cd task-manager-api
   npm start
   ```
2. **Send GET Request (Uncached / First Request):**
   - Method: `GET`
   - URL: `http://localhost:5000/tasks`
   - Check Headers: `X-Cache: MISS`
   - Note the **Time** in Postman (e.g., `~20–45 ms`).
3. **Send GET Request Immediately (Cached):**
   - Click **Send** 2–3 more times.
   - Check Headers: `X-Cache: HIT`
   - Note the **Time** in Postman (drops to `~4–6 ms`).
4. **Test Write Invalidation:**
   - Send `POST http://localhost:5000/tasks` with JSON body:
     ```json
     { "title": "Test Caching Invalidation", "priority": "high" }
     ```
   - Then immediately send `GET http://localhost:5000/tasks`.
   - Notice `X-Cache: MISS` appears, verifying the cache was flushed and your new task appears!
5. **Inspect Live Metrics:**
   - Send `GET http://localhost:5000/debug/cache`
   - View `hits`, `misses`, `hitRatio`, and active keys.
