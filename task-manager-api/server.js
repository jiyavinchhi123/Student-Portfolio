const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for frontend integration
app.use(cors());

// Parse incoming request JSON payloads
app.use(express.json());

// 1. Global Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[LOG] ${req.method} ${req.url} - ${timestamp}`);
  next();
});

// 2. Content-Type Verification Middleware for POST & PUT
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing Content-Type header. Requests with bodies must include 'Content-Type: application/json'"
      });
    }
    if (!contentType.includes('application/json')) {
      return res.status(415).json({
        error: "Unsupported Media Type",
        message: "Unsupported Content-Type. Request body must be in JSON format ('application/json')"
      });
    }
  }
  next();
});

// In-Memory Task Database
let tasks = [
  {
    id: 1,
    title: "Understand Express Middleware",
    description: "Review next() and request/response lifecycle.",
    completed: true
  },
  {
    id: 2,
    title: "Build Task Manager API",
    description: "Implement GET, POST, PUT, and DELETE routes.",
    completed: false
  },
  {
    id: 3,
    title: "Integrate with Student Portfolio",
    description: "Build an interactive pipeline visualizer in React.",
    completed: false
  }
];

// 3. Route-Specific Middleware: Validate Task ID Format
const validateTaskId = (req, res, next) => {
  const rawId = req.params.id;
  const parsedId = parseInt(rawId, 10);
  
  // Validate that the ID is a valid number and positive integer
  if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== rawId) {
    return res.status(400).json({
      error: "Bad Request",
      message: `Invalid task ID format '${rawId}'. ID must be a positive integer.`
    });
  }
  
  req.taskId = parsedId;
  next();
};

// --- RESTful Endpoints ---

// GET /tasks - Read all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// GET /tasks/:id - Read task by ID
app.get('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find(t => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({
      error: "Not Found",
      message: `Task with ID ${req.taskId} not found.`
    });
  }
  res.status(200).json(task);
});

// POST /tasks - Create a task
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  
  // Validate title parameter
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: "Bad Request",
      message: "Task title is required and must be a non-empty string."
    });
  }
  
  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title: title.trim(),
    description: description ? String(description).trim() : "",
    completed: false
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update an existing task
app.put('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find(t => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({
      error: "Not Found",
      message: `Task with ID ${req.taskId} not found.`
    });
  }
  
  const { title, description, completed } = req.body;
  
  // Input validations if properties are present
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Task title must be a non-empty string."
    });
  }
  
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      error: "Bad Request",
      message: "Task completed status must be a boolean."
    });
  }
  
  // Apply updates
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = String(description).trim();
  if (completed !== undefined) task.completed = completed;
  
  res.status(200).json(task);
});

// DELETE /tasks/:id - Delete task
app.delete('/tasks/:id', validateTaskId, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.taskId);
  if (index === -1) {
    return res.status(404).json({
      error: "Not Found",
      message: `Task with ID ${req.taskId} not found.`
    });
  }
  
  const deletedTask = tasks.splice(index, 1)[0];
  res.status(200).json({
    message: "Task deleted successfully.",
    task: deletedTask
  });
});

// Trigger a deliberate server error to test Global Error Handling (for testing only)
app.get('/trigger-error', (req, res, next) => {
  next(new Error("Deliberately triggered server error for demonstration."));
});

// 4. Catch-All Middleware for Undefined Routes
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url} - The requested route does not exist on this server.`
  });
});

// 5. Centralized Global Error Handling Middleware (must be defined last)
app.use((err, req, res, next) => {
  console.error("[ERROR] Global Exception Handler caught an error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred on the server.",
    // Do not leak detailed stack traces to client in production
    hint: "If testing error handling, verify server console logs for stack trace detail."
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Task Manager API running at http://localhost:${PORT}`);
  console.log(`Global logger and Content-Type validators active.`);
  console.log(`==================================================`);
});
