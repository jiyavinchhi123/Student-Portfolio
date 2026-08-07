require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for frontend integration
app.use(cors());

// Parse incoming request JSON payloads
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

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

// 3. Route-Specific Middleware: Validate Task ID Format (now checking for Mongoose ObjectId)
const validateTaskId = (req, res, next) => {
  const rawId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(rawId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: `Invalid task ID format '${rawId}'. ID must be a valid 24-character hexadecimal string.`
    });
  }
  req.taskId = rawId;
  next();
};

// --- RESTful Endpoints ---

// GET /tasks - Read all tasks from MongoDB
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Read task by MongoDB ObjectId
app.get('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findById(req.taskId);
    if (!task) {
      return res.status(404).json({
        error: "Not Found",
        message: `Task with ID ${req.taskId} not found.`
      });
    }
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create a task in MongoDB
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    
    // Explicit title presence check (Mongoose schema also catches this, but this gives a friendly error)
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: "Bad Request",
        message: "Task title is required and must be a non-empty string."
      });
    }
    
    const newTask = await Task.create({
      title,
      description,
      priority
    });
    
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Update an existing task in MongoDB
app.put('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    
    // Perform lookup first to ensure it exists
    const task = await Task.findById(req.taskId);
    if (!task) {
      return res.status(404).json({
        error: "Not Found",
        message: `Task with ID ${req.taskId} not found.`
      });
    }
    
    // Build update object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) updates.completed = completed;
    if (priority !== undefined) updates.priority = priority;
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.taskId,
      updates,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - Delete task from MongoDB
app.delete('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.taskId);
    if (!deletedTask) {
      return res.status(404).json({
        error: "Not Found",
        message: `Task with ID ${req.taskId} not found.`
      });
    }
    res.status(200).json({
      message: "Task deleted successfully.",
      task: deletedTask
    });
  } catch (err) {
    next(err);
  }
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

// 5. Centralized Global Error Handling Middleware (handles Mongoose validation errors nicely)
app.use((err, req, res, next) => {
  console.error("[ERROR] Global Exception Handler caught an error:", err.stack);
  
  // Clean, structured error handling for Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      error: "Bad Request",
      message: "Database validation failed.",
      details: errorDetails
    });
  }
  
  // Clean, structured error handling for Cast Errors (e.g. invalid Hex structure for ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: "Bad Request",
      message: `Data format conversion failed for field: ${err.path}. Expected valid type.`
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred on the server.",
    hint: "If testing error handling, verify server console logs for stack trace detail."
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Task Manager API running at http://localhost:${PORT}`);
  console.log(`Global logger and MongoDB connection active.`);
  console.log(`==================================================`);
});
