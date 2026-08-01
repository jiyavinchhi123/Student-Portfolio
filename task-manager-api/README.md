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

### Tasks Resource

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Retrieve all tasks | `200 OK` |
| **GET** | `/tasks/:id` | Retrieve a specific task by numeric ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **POST** | `/tasks` | Create a new task (body requires `title`) | `201 Created`, `400 Bad Request`, `415 Unsupported Media Type` |
| **PUT** | `/tasks/:id` | Update an existing task properties | `200 OK`, `400 Bad Request`, `404 Not Found`, `415 Unsupported Media Type` |
| **DELETE** | `/tasks/:id` | Delete a task | `200 OK`, `400 Bad Request`, `404 Not Found` |

### Utility Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
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
