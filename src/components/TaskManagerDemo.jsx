import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiActivity,
  FiCheck,
  FiTrash2,
  FiPlus,
  FiRotateCw,
  FiServer,
  FiAlertTriangle,
  FiCode,
  FiTerminal,
  FiArrowRight,
  FiInfo,
  FiX
} from "react-icons/fi";

const SERVER_URL = "http://localhost:5000";

// Middleware configuration
const PIPELINE_STEPS = [
  { id: "cors", label: "CORS Middleware", desc: "Verifies domain whitelist (port 5173/etc.)" },
  { id: "json", label: "express.json()", desc: "Parses request body as JSON" },
  { id: "logger", label: "Request Logger", desc: "Logs method, url, and timestamp" },
  { id: "content-type", label: "Content-Type Validator", desc: "Rejects POST/PUT if header isn't application/json" },
  { id: "id-validator", label: "ID Format Validator", desc: "Rejects if route ID isn't positive integer" },
  { id: "controller", label: "Express Controller", desc: "Processes database/array actions" },
  { id: "error-handler", label: "Global Error / 404 Handler", desc: "Catches failures, formats JSON response" }
];

export default function TaskManagerDemo() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Pipeline Animation State
  const [activeStep, setActiveStep] = useState("idle"); // 'idle', or step ID
  const [pipelineLog, setPipelineLog] = useState("System idle. Perform an action to view request lifecycle.");
  
  // API Request/Response Terminal State
  const [apiLogs, setApiLogs] = useState([]);
  
  // Simulation Controls
  const [simulateNoContentType, setSimulateNoContentType] = useState(false);
  const [simulateInvalidId, setSimulateInvalidId] = useState(false);
  const [customIdInput, setCustomIdInput] = useState("");
  const [errorTriggered, setErrorTriggered] = useState(false);

  // Initial Check for Backend Connection
  const checkBackend = async (showNotification = false) => {
    setCheckingConnection(true);
    try {
      const response = await fetch(`${SERVER_URL}/tasks`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        setBackendOnline(true);
        setUseFallback(false);
        const data = await response.json();
        setTasks(data);
        addApiLog("GET", "/tasks", null, response.status, data, { "Content-Type": "application/json" });
      } else {
        throw new Error("Server not responding correctly");
      }
    } catch (err) {
      setBackendOnline(false);
      setUseFallback(true);
      // Load fallback tasks from LocalStorage
      const stored = localStorage.getItem("portfolio_tasks");
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        const defaultTasks = [
          { id: 1, title: "Understand Express Middleware (Fallback Mode)", description: "Express server is offline, simulating on client.", completed: true },
          { id: 2, title: "Start Node Express Server", description: "Run 'npm start' in task-manager-api subfolder.", completed: false },
          { id: 3, title: "Integrate with Student Portfolio", description: "This interactive page is working now!", completed: false }
        ];
        setTasks(defaultTasks);
        localStorage.setItem("portfolio_tasks", JSON.stringify(defaultTasks));
      }
      if (showNotification) {
        addApiLog("GET", "/tasks", null, "OFFLINE FALLBACK", tasks, {});
      }
    } finally {
      setCheckingConnection(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  // Log API interaction
  const addApiLog = (method, url, requestBody, status, responseBody, requestHeaders = {}) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      requestHeaders: {
        "Accept": "application/json",
        ...requestHeaders
      },
      requestBody,
      status,
      responseBody
    };
    setApiLogs(prev => [newLog, ...prev].slice(0, 15)); // Keep last 15 logs
  };

  // Helper to run pipeline animation
  const animatePipeline = async (method, path, body, requiresId = false, isIdValid = true) => {
    const stepsToAnimate = ["cors", "json", "logger", "content-type"];
    
    // Step 1: CORS
    setActiveStep("cors");
    setPipelineLog("CORS: Validating request source origin headers...");
    await sleep(250);
    
    // Step 2: json parser
    setActiveStep("json");
    setPipelineLog("express.json(): Parsing request payload buffer...");
    await sleep(250);
    
    // Step 3: Logger
    setActiveStep("logger");
    setPipelineLog(`Logger: ${method} ${path} logged to console at ${new Date().toLocaleTimeString()}`);
    await sleep(250);

    // Step 4: Content Type Check
    setActiveStep("content-type");
    if ((method === "POST" || method === "PUT") && simulateNoContentType) {
      setPipelineLog("Content-Type Validator: Rejected! Missing/invalid Content-Type header.");
      await sleep(250);
      setActiveStep("error-handler");
      setPipelineLog("Global Error Handler: Dispatched 415 Unsupported Media Type.");
      return false;
    }
    setPipelineLog("Content-Type Validator: Valid application/json headers detected.");
    await sleep(250);

    // Step 5: ID Validation (if applicable)
    if (requiresId) {
      setActiveStep("id-validator");
      if (!isIdValid) {
        setPipelineLog("ID Validator: Rejected! ID parameter must be a positive integer.");
        await sleep(250);
        setActiveStep("error-handler");
        setPipelineLog("Global Error Handler: Dispatched 400 Bad Request.");
        return false;
      }
      setPipelineLog("ID Validator: Valid numeric ID format detected.");
      await sleep(250);
    }

    // Step 6: Route Controller
    setActiveStep("controller");
    setPipelineLog("Express Controller: Executing CRUD controller operation...");
    await sleep(250);

    return true;
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // --- CRUD Operations ---

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const bodyData = { title, description };
    const headers = simulateNoContentType ? {} : { "Content-Type": "application/json" };
    
    const passedPipeline = await animatePipeline("POST", "/tasks", bodyData);
    
    if (!passedPipeline) {
      // Simulate Content Type failure locally
      const status = simulateNoContentType ? 415 : 400;
      const errorMsg = simulateNoContentType 
        ? { error: "Unsupported Media Type", message: "Unsupported Content-Type. Request body must be in JSON format ('application/json')" }
        : { error: "Bad Request", message: "Task title is required." };
      addApiLog("POST", "/tasks", bodyData, status, errorMsg, headers);
      setLoading(false);
      return;
    }

    if (useFallback) {
      // Fallback local storage creation
      const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        title: title.trim(),
        description: description.trim(),
        completed: false
      };
      const updated = [...tasks, newTask];
      setTasks(updated);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updated));
      addApiLog("POST", "/tasks", bodyData, 201, newTask, headers);
      setActiveStep("idle");
      setPipelineLog("Success: Task created in client-side state!");
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/tasks`, {
          method: "POST",
          headers,
          body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => [...prev, data]);
          addApiLog("POST", "/tasks", bodyData, response.status, data, headers);
          setActiveStep("idle");
          setPipelineLog("Success: Server created task and returned 201 Created!");
        } else {
          setActiveStep("error-handler");
          setPipelineLog(`Failed: Express Server returned status ${response.status}`);
          addApiLog("POST", "/tasks", bodyData, response.status, data, headers);
        }
      } catch (err) {
        setActiveStep("error-handler");
        setPipelineLog("Network Exception caught in pipeline!");
        addApiLog("POST", "/tasks", bodyData, 500, { error: "Network Error", message: err.message }, headers);
      }
    }

    setTitle("");
    setDescription("");
    setLoading(false);
  };

  // Toggle Complete Task (PUT)
  const handleToggleComplete = async (task) => {
    const updatedStatus = !task.completed;
    const bodyData = { completed: updatedStatus };
    const headers = simulateNoContentType ? {} : { "Content-Type": "application/json" };

    const isIdValid = !simulateInvalidId;
    const passedPipeline = await animatePipeline("PUT", `/tasks/${task.id}`, bodyData, true, isIdValid);

    if (!passedPipeline) {
      const status = simulateNoContentType ? 415 : 400;
      const errorMsg = simulateNoContentType
        ? { error: "Unsupported Media Type", message: "Content-Type must be application/json" }
        : { error: "Bad Request", message: "Invalid task ID format." };
      addApiLog("PUT", `/tasks/${task.id}`, bodyData, status, errorMsg, headers);
      return;
    }

    if (useFallback) {
      const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t);
      setTasks(updatedTasks);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updatedTasks));
      addApiLog("PUT", `/tasks/${task.id}`, bodyData, 200, { ...task, completed: updatedStatus }, headers);
      setActiveStep("idle");
      setPipelineLog(`Success: Toggled task ${task.id} in client-side state.`);
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/tasks/${task.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => prev.map(t => t.id === task.id ? data : t));
          addApiLog("PUT", `/tasks/${task.id}`, bodyData, response.status, data, headers);
          setActiveStep("idle");
          setPipelineLog(`Success: Server updated task ${task.id} and returned 200 OK!`);
        } else {
          setActiveStep("error-handler");
          setPipelineLog(`Failed: Server returned status ${response.status}`);
          addApiLog("PUT", `/tasks/${task.id}`, bodyData, response.status, data, headers);
        }
      } catch (err) {
        setActiveStep("error-handler");
        addApiLog("PUT", `/tasks/${task.id}`, bodyData, 500, { error: err.message }, headers);
      }
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    const isIdValid = !simulateInvalidId;
    const passedPipeline = await animatePipeline("DELETE", `/tasks/${id}`, null, true, isIdValid);

    if (!passedPipeline) {
      addApiLog("DELETE", `/tasks/${id}`, null, 400, { error: "Bad Request", message: "Invalid task ID format." });
      return;
    }

    if (useFallback) {
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updatedTasks));
      addApiLog("DELETE", `/tasks/${id}`, null, 200, { message: "Task deleted successfully.", task: { id } });
      setActiveStep("idle");
      setPipelineLog(`Success: Deleted task ${id} from client-side state.`);
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/tasks/${id}`, {
          method: "DELETE"
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => prev.filter(t => t.id !== id));
          addApiLog("DELETE", `/tasks/${id}`, null, response.status, data);
          setActiveStep("idle");
          setPipelineLog(`Success: Server deleted task ${id} and returned 200 OK!`);
        } else {
          setActiveStep("error-handler");
          setPipelineLog(`Failed: Server returned status ${response.status}`);
          addApiLog("DELETE", `/tasks/${id}`, null, response.status, data);
        }
      } catch (err) {
        setActiveStep("error-handler");
        addApiLog("DELETE", `/tasks/${id}`, null, 500, { error: err.message });
      }
    }
  };

  // Custom Operations (Testing Validation Middlewares)
  const handleQueryCustomId = async () => {
    if (!customIdInput.trim()) return;
    const id = customIdInput.trim();
    
    // Check if format is integer
    const isIdValid = /^\d+$/.test(id) && parseInt(id, 10) > 0;
    
    const passedPipeline = await animatePipeline("GET", `/tasks/${id}`, null, true, isIdValid);
    
    if (!passedPipeline) {
      addApiLog("GET", `/tasks/${id}`, null, 400, {
        error: "Bad Request",
        message: `Invalid task ID format '${id}'. ID must be a positive integer.`
      });
      return;
    }

    if (useFallback) {
      const task = tasks.find(t => t.id === parseInt(id, 10));
      if (task) {
        addApiLog("GET", `/tasks/${id}`, null, 200, task);
        setActiveStep("idle");
        setPipelineLog(`Success: Found task ${id} in local storage.`);
      } else {
        setActiveStep("error-handler");
        setPipelineLog(`Not Found: Task ${id} does not exist.`);
        addApiLog("GET", `/tasks/${id}`, null, 404, { error: "Not Found", message: `Task with ID ${id} not found.` });
      }
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/tasks/${id}`);
        const data = await response.json();
        if (response.ok) {
          addApiLog("GET", `/tasks/${id}`, null, response.status, data);
          setActiveStep("idle");
          setPipelineLog(`Success: Server returned task ${id} details.`);
        } else {
          setActiveStep("error-handler");
          setPipelineLog(`Failed: Server returned status ${response.status}`);
          addApiLog("GET", `/tasks/${id}`, null, response.status, data);
        }
      } catch (err) {
        setActiveStep("error-handler");
        addApiLog("GET", `/tasks/${id}`, null, 500, { error: err.message });
      }
    }
  };

  const handleTriggerServerError = async () => {
    setActiveStep("cors");
    await sleep(150);
    setActiveStep("json");
    await sleep(150);
    setActiveStep("logger");
    await sleep(150);
    setActiveStep("controller");
    setPipelineLog("Controller: Route throws an Error exception...");
    await sleep(250);
    setActiveStep("error-handler");
    setPipelineLog("Global Error Handler: Caught exception. Responding with status 500.");
    
    if (useFallback) {
      addApiLog("GET", "/trigger-error", null, 500, {
        error: "Internal Server Error",
        message: "An unexpected error occurred on the server.",
        hint: "Client-side simulation of global express error handler catching error."
      });
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/trigger-error`);
        const data = await response.json();
        addApiLog("GET", "/trigger-error", null, response.status, data);
      } catch (err) {
        addApiLog("GET", "/trigger-error", null, 500, { error: "Connection Error", message: err.message });
      }
    }
  };

  const handleTriggerRouteNotFound = async () => {
    setActiveStep("cors");
    await sleep(150);
    setActiveStep("json");
    await sleep(150);
    setActiveStep("logger");
    await sleep(150);
    setActiveStep("error-handler");
    setPipelineLog("Catch-All 404 Route Handler: Undefined endpoint detected.");

    if (useFallback) {
      addApiLog("GET", "/undefined-route-abc", null, 404, {
        error: "Not Found",
        message: "Cannot GET /undefined-route-abc - The requested route does not exist."
      });
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/undefined-route-abc`);
        const data = await response.json();
        addApiLog("GET", "/undefined-route-abc", null, response.status, data);
      } catch (err) {
        addApiLog("GET", "/undefined-route-abc", null, 404, { error: "Route not found", message: err.message });
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            <FiCode /> LAB ASSIGNMENT PREVIEW
          </div>
          <h1 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
            Task Manager Express API
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Interactive playground demonstrating HTTP REST endpoints and an Express middleware pipeline. Run the backend locally to see real integration!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="px-4 py-2 text-sm font-semibold rounded-full border border-slate-300 text-slate-700 dark:border-white/10 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
          >
            Back to Projects
          </Link>
          <button
            onClick={() => checkBackend(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 transition"
          >
            <FiRotateCw className={checkingConnection ? "animate-spin" : ""} /> Re-ping Backend
          </button>
        </div>
      </div>

      {/* Backend Status Warning */}
      <AnimatePresence>
        {!backendOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 text-xl shrink-0 animate-pulse">
                <FiAlertTriangle />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Express Server Offline (`http://localhost:5000`)</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                  Currently running in <strong>fallback client-side mode</strong>. Start the node server locally to try out true HTTP requests and logging.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border border-amber-500/20 bg-amber-500/5 px-3 py-1 rounded text-xs">
              <span className="font-mono">cd task-manager-api && npm run dev</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interface Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (GRID COLS 7): Task App Client */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Dashboard Control & Status Bar */}
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <div className="text-sm">
                Status: <span className="font-semibold">{backendOnline ? "Connected to Local Server" : "Client Fallback Mode"}</span>
              </div>
            </div>
            {backendOnline && (
              <button
                onClick={() => setUseFallback(!useFallback)}
                className="px-3 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition text-slate-700 dark:text-slate-300"
              >
                {useFallback ? "Switch to Server" : "Force Fallback Demo"}
              </button>
            )}
          </div>

          {/* Task Manager UI Box */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 flex flex-col gap-6 shadow-sm">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <FiServer className="text-blue-500" /> Interactive Task Client
            </h3>
            
            {/* Create Task Form */}
            <form onSubmit={handleCreateTask} className="grid sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Learn Express"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="sm:col-span-5 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Study routes and middleware"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FiPlus /> Add
                </button>
              </div>
            </form>

            {/* Error & Middleware Validation Simulation Checks */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs grid sm:grid-cols-2 gap-4">
              <div>
                <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Simulate Middleware Failures</h5>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateNoContentType}
                      onChange={(e) => setSimulateNoContentType(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Omit Content-Type (POST/PUT)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateInvalidId}
                      onChange={(e) => setSimulateInvalidId(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Simulate invalid ID format (e.g. "abc")</span>
                  </label>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Endpoint Testing Actions</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleTriggerServerError}
                    className="px-2.5 py-1.5 rounded bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-semibold border border-red-500/20 transition text-[11px]"
                  >
                    GET /trigger-error
                  </button>
                  <button
                    onClick={handleTriggerRouteNotFound}
                    className="px-2.5 py-1.5 rounded bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-white/5 transition text-[11px]"
                  >
                    GET /invalid-path
                  </button>
                </div>
              </div>
            </div>

            {/* Custom ID Tester */}
            <div className="flex items-end gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="flex-grow flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Test Query By Task ID (validateTaskId middleware)</label>
                <input
                  type="text"
                  placeholder="Enter positive integer (or 'abc' to test validation)"
                  value={customIdInput}
                  onChange={(e) => setCustomIdInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <button
                type="button"
                onClick={handleQueryCustomId}
                disabled={!customIdInput.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition"
              >
                Send GET
              </button>
            </div>

            {/* Task Cards List */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No tasks available. Add some tasks above to begin testing.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 group transition hover:border-blue-500/50"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 transition ${
                          task.completed
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 dark:border-white/20 text-transparent hover:border-blue-500"
                        }`}
                      >
                        <FiCheck className="stroke-[3]" />
                      </button>
                      <div>
                        <span className={`text-sm font-semibold transition ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-white"}`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className={`text-xs mt-0.5 ${task.completed ? "text-slate-400 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"}`}>
                            {task.description}
                          </p>
                        )}
                        <span className="inline-block mt-2 px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded font-mono text-[9px] text-slate-500 dark:text-slate-400">
                          ID: {task.id}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                      title="Delete task"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (GRID COLS 5): Middleware pipeline visualizer and Console Logs */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Express Pipeline Diagram */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <FiActivity className="text-blue-500 animate-pulse" /> Express Middleware Pipeline
            </h3>
            
            {/* Steps Container */}
            <div className="flex flex-col gap-2.5">
              {PIPELINE_STEPS.map((step, idx) => {
                const isActive = activeStep === step.id;
                const isCanceled = activeStep === "error-handler" && step.id === "controller";
                
                let stepBg = "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5";
                let textColor = "text-slate-800 dark:text-slate-200";
                
                if (isActive) {
                  if (step.id === "error-handler") {
                    stepBg = "bg-red-600/25 border-red-500 dark:bg-red-600/20";
                    textColor = "text-red-600 dark:text-red-400 font-bold scale-[1.02]";
                  } else {
                    stepBg = "bg-blue-600/20 border-blue-500 dark:bg-blue-600/15";
                    textColor = "text-blue-600 dark:text-blue-400 font-bold scale-[1.02]";
                  }
                } else if (isCanceled) {
                  stepBg = "opacity-40 border-dashed";
                }
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    {/* Pipeline step box */}
                    <div className={`w-full p-3 rounded-xl border flex gap-3 items-start transition-all duration-300 ${stepBg}`}>
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs ${isActive ? "bg-blue-600 text-white font-bold" : "bg-slate-200 dark:bg-white/10 text-slate-500"}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className={`text-xs font-semibold ${textColor}`}>{step.label}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">{step.desc}</p>
                      </div>
                    </div>

                    {/* Arrow to next step */}
                    {idx < PIPELINE_STEPS.length - 1 && (
                      <FiArrowRight className="rotate-90 my-1 text-slate-300 dark:text-white/20 text-sm" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pipeline Status Logger */}
            <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex gap-2 items-start text-xs font-mono text-emerald-400">
              <span className="text-slate-500 shrink-0 select-none">&gt;</span>
              <span>{pipelineLog}</span>
            </div>
          </div>

          {/* API Logging Terminal Console */}
          <div className="p-6 rounded-2xl bg-[#0d1117] border border-slate-800 shadow-md text-slate-200 flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="flex items-center gap-1.5"><FiTerminal /> HTTP Request Console</span>
              <button
                onClick={() => setApiLogs([])}
                className="hover:text-white transition"
              >
                Clear
              </button>
            </div>
            
            {/* Terminal logs list */}
            <div className="max-h-[300px] overflow-y-auto space-y-4 text-xs pr-1">
              {apiLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-6">
                  Terminal ready. Send queries from task client.
                </div>
              ) : (
                apiLogs.map((log) => {
                  const isError = log.status === "OFFLINE FALLBACK" || log.status >= 400;
                  
                  return (
                    <div key={log.id} className="border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>{log.timestamp}</span>
                        <span>HOST: localhost:5000</span>
                      </div>
                      
                      {/* Request block */}
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === "GET" ? "bg-emerald-600/20 text-emerald-400" :
                          log.method === "POST" ? "bg-blue-600/20 text-blue-400" :
                          log.method === "PUT" ? "bg-amber-600/20 text-amber-400" : "bg-red-600/20 text-red-400"
                        }`}>
                          {log.method}
                        </span>
                        <span className="text-white font-bold">{log.url}</span>
                      </div>

                      {/* Request Headers & Body */}
                      <div className="mt-1.5 pl-3 border-l border-slate-800 flex flex-col gap-1 text-[10px] text-slate-400">
                        <div>
                          <span className="text-slate-500">Headers:</span> {JSON.stringify(log.requestHeaders)}
                        </div>
                        {log.requestBody && (
                          <div>
                            <span className="text-slate-500">Payload:</span> {JSON.stringify(log.requestBody)}
                          </div>
                        )}
                      </div>

                      {/* Response block */}
                      <div className="mt-1.5 flex items-start gap-2">
                        <span className="text-slate-500 shrink-0">◀ Response:</span>
                        <div className="flex-grow">
                          <div className={`font-bold ${isError ? "text-red-400" : "text-emerald-400"}`}>
                            Status {log.status}
                          </div>
                          <pre className="mt-1 p-2 bg-[#161b22] border border-slate-800 rounded text-[10px] text-slate-300 overflow-x-auto">
                            {JSON.stringify(log.responseBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
