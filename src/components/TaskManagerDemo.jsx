import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiTrash2,
  FiPlus,
  FiRotateCw,
  FiServer,
  FiAlertTriangle,
  FiCode,
  FiSearch,
  FiCheckSquare,
  FiAlertCircle,
  FiGrid
} from "react-icons/fi";

const SERVER_URL = "http://localhost:5000";

export default function TaskManagerDemo() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Notifications
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Check for Backend Connection
  const checkBackend = async (showPingNotification = false) => {
    setCheckingConnection(true);
    try {
      const response = await fetch(`${SERVER_URL}/tasks`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        setBackendOnline(true);
        setUseFallback(false);
        const data = await response.json();
        setTasks(data);
        if (showPingNotification) {
          showToast("Connected to live MongoDB server!", "success");
        }
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
          { id: 1, title: "Understand Express Middleware (Fallback Mode)", description: "Express server is offline, simulating on client.", completed: true, priority: "high" },
          { id: 2, title: "Start Node Express Server", description: "Run 'npm start' in task-manager-api subfolder.", completed: false, priority: "high" },
          { id: 3, title: "Integrate with Student Portfolio", description: "This interactive page is working now!", completed: false, priority: "medium" }
        ];
        setTasks(defaultTasks);
        localStorage.setItem("portfolio_tasks", JSON.stringify(defaultTasks));
      }
      if (showPingNotification) {
        showToast("Backend offline. Fallback client-side active.", "warning");
      }
    } finally {
      setCheckingConnection(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  // --- CRUD Operations ---

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const bodyData = { title, description, priority };

    if (useFallback) {
      const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id || 0)) + 1 : 1,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        createdAt: new Date().toISOString()
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updated));
      showToast("Task added locally (Fallback mode)!");
      setLoading(false);
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => [data, ...prev]);
          showToast("Task created in MongoDB database!");
        } else {
          showToast(data.message || "Failed to create task on server.", "error");
        }
      } catch (err) {
        showToast("Failed to connect to the server.", "error");
      } finally {
        setLoading(false);
      }
    }

    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  // Toggle Complete Task (PUT)
  const handleToggleComplete = async (task) => {
    const updatedStatus = !task.completed;
    const targetId = task._id || task.id;
    const bodyData = { completed: updatedStatus };

    if (useFallback) {
      const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t);
      setTasks(updatedTasks);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updatedTasks));
      showToast(`Task marked as ${updatedStatus ? "completed" : "pending"}!`);
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/tasks/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => prev.map(t => (t._id === targetId || t.id === targetId) ? data : t));
          showToast(`Task marked as ${updatedStatus ? "completed" : "pending"}!`);
        } else {
          showToast(data.message || "Failed to update task.", "error");
        }
      } catch (err) {
        showToast("Server update error occurred.", "error");
      }
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (useFallback) {
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updatedTasks));
      showToast("Task deleted from local workspace.");
    } else {
      try {
        const response = await fetch(`${SERVER_URL}/tasks/${id}`, {
          method: "DELETE"
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => prev.filter(t => t._id !== id && t.id !== id));
          showToast("Task removed from MongoDB.");
        } else {
          showToast(data.message || "Failed to delete task.", "error");
        }
      } catch (err) {
        showToast("Error connecting to server.", "error");
      }
    }
  };

  // Stats Calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityCount = tasks.filter(t => t.priority === "high" && !t.completed).length;

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "completed" && task.completed) || 
                         (statusFilter === "pending" && !task.completed);
                         
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8 font-sans antialiased text-slate-800 dark:text-slate-200">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              notification.type === "error" ? "bg-red-500/10 border-red-500/25 text-red-500" :
              notification.type === "warning" ? "bg-amber-500/10 border-amber-500/25 text-amber-500" :
              "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
            }`}
          >
            {notification.type === "error" ? <FiAlertCircle className="shrink-0" /> : <FiCheckSquare className="shrink-0" />}
            <span className="text-sm font-semibold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            <FiCode /> FULL STACK TASK SPACE
          </div>
          <h1 className="text-3xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight">
            Creative Task Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            A premium full-stack dashboard demonstrating reactive state management, asynchronous data fetching, and Mongoose database model schemas.
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg shadow-blue-500/20"
          >
            <FiRotateCw className={checkingConnection ? "animate-spin" : ""} /> Sync Database
          </button>
        </div>
      </div>

      {/* Offline Alert Warning */}
      <AnimatePresence>
        {!backendOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 text-lg shrink-0 animate-pulse">
                <FiAlertTriangle />
              </div>
              <div>
                <h4 className="font-semibold text-sm">MongoDB connection offline (`localhost:5000`)</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                  Currently running in <strong>client-side storage fallback mode</strong>. Launch the backend Node API to connect your live MongoDB schema.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border border-amber-500/10 bg-amber-500/5 px-3 py-1 rounded font-mono text-xs text-amber-600/90 dark:text-amber-400/90">
              cd task-manager-api && npm start
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Status & Database Control */}
      <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          <div className="text-sm">
            Database Status: <span className="font-semibold">{backendOnline ? "Connected to MongoDB via Express API" : "Offline (Local Storage)"}</span>
          </div>
        </div>
        {backendOnline && (
          <button
            onClick={() => {
              setUseFallback(!useFallback);
              showToast(useFallback ? "Connected to MongoDB." : "Forced local fallback mode.", "warning");
            }}
            className="px-3 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition text-slate-700 dark:text-slate-300"
          >
            {useFallback ? "Switch to Mongoose" : "Simulate Offline"}
          </button>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Tasks</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Completed</span>
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Pending</span>
          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{pendingCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">High Priority</span>
          <span className="text-3xl font-extrabold text-red-500">{highPriorityCount}</span>
        </div>
      </div>

      {/* Main Workspace Dashboard */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Add Task Form (Grid: 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <FiServer className="text-blue-500" /> New Task
            </h3>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Implement user login"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Describe details of the task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority Label</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="low" className="text-slate-800 bg-white">Low Priority</option>
                  <option value="medium" className="text-slate-800 bg-white">Medium Priority</option>
                  <option value="high" className="text-slate-800 bg-white">High Priority</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/10"
              >
                <FiPlus /> Create Task
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Task List Dashboard (Grid: 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Filters Toolbar */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <FiSearch />
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Task Feed Container */}
          <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-slate-400"
                >
                  <FiGrid className="text-3xl mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No tasks matched your workspace filters.</p>
                </motion.div>
              ) : (
                filteredTasks.map((task) => {
                  const taskId = task._id || task.id;
                  return (
                    <motion.div
                      layout
                      key={taskId}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 group hover:shadow-lg dark:hover:bg-white/10 transition-all duration-300 hover:border-blue-500/50"
                    >
                      <div className="flex items-start gap-4 flex-grow">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 transition-all duration-300 ${
                            task.completed
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 dark:border-white/20 text-transparent hover:border-blue-500 hover:scale-105"
                          }`}
                        >
                          <FiCheck className="stroke-[3]" />
                        </button>
                        
                        <div className="flex-grow">
                          <span className={`text-base font-bold transition-all duration-300 ${
                            task.completed 
                              ? "line-through text-slate-400 dark:text-slate-500" 
                              : "text-slate-900 dark:text-white"
                          }`}>
                            {task.title}
                          </span>
                          
                          {task.description && (
                            <p className={`text-sm mt-1 leading-relaxed ${
                              task.completed 
                                ? "text-slate-400/80 dark:text-slate-600" 
                                : "text-slate-500 dark:text-slate-400"
                            }`}>
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 items-center mt-3">
                            {task.priority && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                                task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-slate-500/10 text-slate-500 border-slate-500/20'
                              }`}>
                                {task.priority} Priority
                              </span>
                            )}
                            
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-md font-mono text-[9px] text-slate-400 dark:text-slate-500">
                              REF: {taskId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(taskId)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 focus:opacity-100 shrink-0"
                        title="Delete task"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
