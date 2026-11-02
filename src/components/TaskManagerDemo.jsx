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
  FiGrid,
  FiActivity,
  FiClock,
  FiUser,
  FiZap,
  FiShield,
  FiCpu,
  FiLayout,
  FiSliders,
  FiX,
  FiEye,
  FiCheckCircle,
  FiEdit2,
  FiLock
} from "react-icons/fi";

// Relative luminance helper for WCAG contrast evaluation
function getLuminance(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return 0.5;
  const c = hex.substring(1);
  const rgb = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  if (isNaN(rgb)) return 0.5;
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

const DEFAULT_SERVER_URL = "http://localhost:5000";

const default4ProjectTasks = [
  {
    id: "proj-1",
    title: "SiyaRang: E-Commerce Product Catalog & Filter Architecture",
    description: "Built responsive grid catalog with dynamic category filters for Bandhani sarees, dupattas, and dress materials with image optimization.",
    completed: true,
    priority: "high",
    category: "SiyaRang",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-2",
    title: "SiyaRang: Secure Cart & Order Processing Pipeline",
    description: "Implemented local shopping cart state, order summary calculator, and secure customer details checkout validation.",
    completed: true,
    priority: "medium",
    category: "SiyaRang",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-3",
    title: "ResumeFit: Semantic Resume-to-Job Fit Scoring Engine",
    description: "Developed scoring algorithm evaluating keywords, qualifications, and experience against target job descriptions to produce score out of 100.",
    completed: true,
    priority: "high",
    category: "ResumeFit",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-4",
    title: "ResumeFit: Supabase Cloud Database & Auth Integration",
    description: "Configured Supabase PostgreSQL storage and auth policies to store user resume versions and evaluation histories.",
    completed: true,
    priority: "medium",
    category: "ResumeFit",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-5",
    title: "FinLite: Automated PDF Balance Sheet & Ledger Generator",
    description: "Engineered automated balance sheet and profit/loss report export module in PDF format with Spring Boot and Python.",
    completed: true,
    priority: "high",
    category: "FinLite",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-6",
    title: "FinLite: Predictive Cash Flow Analytics & Interactive Charts",
    description: "Integrated interactive visual charts for revenue forecasting, expense tracking, and burn-rate calculations.",
    completed: true,
    priority: "medium",
    category: "FinLite",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-7",
    title: "FormFlux: Dynamic Schema Engine & Automatic DB Generation",
    description: "Built dynamic schema generator that auto-creates MongoDB collections on form creation with validation rules.",
    completed: true,
    priority: "high",
    category: "FormFlux",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-8",
    title: "FormFlux: Live Response Tracker & Excel (XLSX) Exporter",
    description: "Developed submission tracking table with instant Excel (.xlsx) data export for real-time survey results.",
    completed: true,
    priority: "medium",
    category: "FormFlux",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-9",
    title: "SiyaRang: Payment Gateway Integration & Webhook Listener",
    description: "Integrate Razorpay payment gateway webhooks for instant transaction confirmation and automated receipt generation.",
    completed: false,
    priority: "high",
    category: "SiyaRang",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  },
  {
    id: "proj-10",
    title: "FormFlux: Custom CSS Theme Builder for Form Creators",
    description: "Add drag-and-drop theme customizer for form creators to style typography, border radiuses, and brand color palettes.",
    completed: false,
    priority: "medium",
    category: "FormFlux",
    assignedUser: "Jiya Vinchhi",
    createdAt: new Date().toISOString()
  }
];

const defaultCompletedShowcaseTasks = default4ProjectTasks.filter(t => t.completed);

export default function TaskManagerDemo({ isAdmin: propIsAdmin }) {
  const isAdmin = propIsAdmin !== undefined 
    ? propIsAdmin 
    : localStorage.getItem("admin_token") === "admin-session-token-998";
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Blue-Green Deployment State (Practical 14 / Assignment 6)
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem("blue_green_port") || DEFAULT_SERVER_URL);
  const [activeVersion, setActiveVersion] = useState("blue");

  const switchBlueGreen = async (targetUrl) => {
    setServerUrl(targetUrl);
    localStorage.setItem("blue_green_port", targetUrl);
    await checkBackend(true, targetUrl);
  };

  // AI-Assisted UI Design Suggestion State (Practical 15 / Assignment 7)
  const [aiDesignModalOpen, setAiDesignModalOpen] = useState(false);
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [designSuggestion, setDesignSuggestion] = useState(null);
  const [isThemeApplied, setIsThemeApplied] = useState(() => !!localStorage.getItem("applied_ai_theme"));
  const [appliedTheme, setAppliedTheme] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("applied_ai_theme"));
    } catch (_) {
      return null;
    }
  });
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedUser, setAssignedUser] = useState("Jiya Vinchhi");
  
  // AI Assistance State (Practical 13)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestionMeta, setAiSuggestionMeta] = useState(null);
  
  // Tab & Background EventEmitter State
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "events"
  const [eventLogs, setEventLogs] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Admin Task Editing Modal State
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    completed: false,
    assignedUser: "Jiya Vinchhi"
  });

  // Notifications
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch recent background events from Express API
  const fetchEventLogs = async (url = serverUrl) => {
    try {
      const response = await fetch(`${url}/debug/events`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        const data = await response.json();
        setEventLogs(data.events || []);
      }
    } catch (err) {
      // Backend may be offline in fallback mode
    }
  };

  // Initial Check for Backend Connection & Version Introspection
  const checkBackend = async (showPingNotification = false, targetUrl = serverUrl) => {
    setCheckingConnection(true);
    try {
      const response = await fetch(`${targetUrl}/tasks`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        setBackendOnline(true);
        setUseFallback(false);
        const data = await response.json();
        const projectTasks = (data || []).filter(t => /siyarang|resumefit|finlite|formflux/i.test(t.title));
        setTasks(projectTasks.length > 0 ? projectTasks : default4ProjectTasks);
        fetchEventLogs(targetUrl);
        
        // Introspect active container version
        try {
          const vRes = await fetch(`${targetUrl}/version`, { signal: AbortSignal.timeout(1000) });
          if (vRes.ok) {
            const vData = await vRes.json();
            setActiveVersion(vData.version || (targetUrl.includes("5001") ? "green" : "blue"));
          }
        } catch (_) {}

        if (showPingNotification) {
          const isGreen = targetUrl.includes("5001");
          showToast(`Traffic routed to ${isGreen ? "GREEN (Port 5001)" : "BLUE (Port 5000)"} container! (Zero downtime)`, "success");
        }
      } else {
        throw new Error("Server not responding correctly");
      }
    } catch (err) {
      setBackendOnline(false);
      setUseFallback(true);
      
      // Load fallback tasks from LocalStorage
      const stored = localStorage.getItem("portfolio_tasks");
      let parsed = [];
      try { parsed = stored ? JSON.parse(stored) : []; } catch (_) {}
      const validProjectTasks = parsed.filter(t => /siyarang|resumefit|finlite|formflux/i.test(t.title));
      if (validProjectTasks.length > 0) {
        setTasks(validProjectTasks);
      } else {
        setTasks(default4ProjectTasks);
        localStorage.setItem("portfolio_tasks", JSON.stringify(default4ProjectTasks));
      }
      if (showPingNotification) {
        showToast("Backend offline. Fallback client-side active.", "warning");
      }
    } finally {
      setCheckingConnection(false);
    }
  };

  const applyAiDesign = (suggestion, showNotification = true) => {
    if (!suggestion?.colors) return;
    const root = document.documentElement;
    root.style.setProperty('--ai-primary', suggestion.colors.primary);
    root.style.setProperty('--ai-secondary', suggestion.colors.secondary);
    if (suggestion.colors.background) root.style.setProperty('--ai-background', suggestion.colors.background);
    if (suggestion.colors.card) root.style.setProperty('--ai-card', suggestion.colors.card);
    if (suggestion.colors.accent) root.style.setProperty('--ai-accent', suggestion.colors.accent);
    if (suggestion.fonts?.heading) root.style.setProperty('--ai-font-heading', suggestion.fonts.heading);
    if (suggestion.fonts?.body) root.style.setProperty('--ai-font-body', suggestion.fonts.body);

    root.classList.add('ai-theme-active');
    setIsThemeApplied(true);
    setAppliedTheme(suggestion);
    localStorage.setItem('applied_ai_theme', JSON.stringify(suggestion));
    if (showNotification) {
      showToast("✨ AI Design tokens applied to :root CSS variables!", "success");
    }
  };

  const resetAiDesign = () => {
    const root = document.documentElement;
    root.style.removeProperty('--ai-primary');
    root.style.removeProperty('--ai-secondary');
    root.style.removeProperty('--ai-background');
    root.style.removeProperty('--ai-card');
    root.style.removeProperty('--ai-accent');
    root.style.removeProperty('--ai-font-heading');
    root.style.removeProperty('--ai-font-body');
    root.classList.remove('ai-theme-active');
    setIsThemeApplied(false);
    setAppliedTheme(null);
    localStorage.removeItem('applied_ai_theme');
    showToast("Restored default UI styling.", "info");
  };

  const fetchDesignSuggestion = async () => {
    setLoadingDesign(true);
    setAiDesignModalOpen(true);
    try {
      const res = await fetch(`${serverUrl}/api/ai/design-suggestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "modern task management productivity workspace" }),
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const data = await res.json();
        setDesignSuggestion(data);
        showToast("AI UI Design suggestions generated!", "success");
      } else {
        throw new Error("HTTP error " + res.status);
      }
    } catch (err) {
      // Graceful fallback preset with high-contrast accessibility
      const fallbackPreset = {
        colors: {
          primary: "#6366f1",
          secondary: "#ec4899",
          background: "#0f172a",
          card: "#1e293b",
          accent: "#06b6d4"
        },
        fonts: {
          heading: "'Outfit', 'Space Grotesk', sans-serif",
          body: "'Inter', 'Sora', sans-serif"
        },
        layoutTip: "Group tasks into collapsible status columns (Kanban style) and place high-priority filters in a sticky header to optimize visual scanability.",
        source: "curated-preset",
        fallback: true,
        disclaimer: "Curated responsive design preset. Review WCAG contrast ratios before production deployment."
      };
      setDesignSuggestion(fallbackPreset);
      showToast("Loaded design suggestions (Fallback Mode)", "warning");
    } finally {
      setLoadingDesign(false);
    }
  };

  useEffect(() => {
    checkBackend();
    const savedTheme = localStorage.getItem("applied_ai_theme");
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        applyAiDesign(parsed, false);
      } catch (_) {}
    }
  }, []);

  // --- External AI Integration (Practical 13) ---
  const handleGenerateAiDescription = async () => {
    if (!title.trim()) {
      showToast("Please enter a task title first to generate an AI description.", "warning");
      return;
    }

    setIsGeneratingAi(true);
    try {
      const response = await fetch(`${serverUrl}/api/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
        signal: AbortSignal.timeout(12000)
      });

      const data = await response.json();

      if (response.status === 429) {
        showToast(data.message || "Rate limit reached. Please wait a few seconds before requesting AI again.", "warning");
        return;
      }

      if (data && data.description) {
        setDescription(data.description);
        if (data.suggestedPriority) {
          setPriority(data.suggestedPriority);
        }
        setAiSuggestionMeta({
          source: data.source || "ai",
          suggestedPriority: data.suggestedPriority,
          fallback: data.fallback || false,
          disclaimer: data.disclaimer || "AI-generated suggestion. Please review and edit before saving."
        });

        if (data.fallback) {
          showToast("AI suggestion generated via graceful degradation engine!", "info");
        } else {
          showToast("✨ AI description & priority generated successfully!", "success");
        }
      } else {
        showToast("No description returned by AI endpoint.", "warning");
      }
    } catch (err) {
      // Graceful client offline fallback if backend API is not responding
      const fallbackDesc = `Implement, test, and document all core requirements for task: "${title.trim()}".`;
      setDescription(fallbackDesc);
      setAiSuggestionMeta({
        source: "client-offline-fallback",
        suggestedPriority: priority,
        fallback: true,
        disclaimer: "Offline heuristic suggestion. Review and edit as needed."
      });
      showToast("Offline fallback description populated.", "info");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleOpenEdit = (task) => {
    if (!isAdmin) return;
    setEditingTask(task);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      completed: task.completed || false,
      assignedUser: task.assignedUser || "Jiya Vinchhi"
    });
  };

  const handleSaveEdit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!isAdmin || !editingTask || !editForm.title.trim()) return;
    const targetId = editingTask._id || editingTask.id;
    const bodyData = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      priority: editForm.priority,
      completed: editForm.completed,
      assignedUser: editForm.assignedUser.trim() || "Jiya Vinchhi"
    };

    if (useFallback) {
      const updated = tasks.map(t => (t._id === targetId || t.id === targetId) ? { ...t, ...bodyData } : t);
      setTasks(updated);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updated));
      showToast("Task updated successfully!");
      setEditingTask(null);
    } else {
      try {
        const response = await fetch(`${serverUrl}/tasks/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => prev.map(t => (t._id === targetId || t.id === targetId) ? data : t));
          showToast("Task updated successfully!");
          setEditingTask(null);
          fetchEventLogs();
        } else {
          showToast(data.message || "Failed to update task.", "error");
        }
      } catch (err) {
        showToast("Error updating task on server.", "error");
      }
    }
  };

  // --- CRUD Operations ---

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Read-only mode: Only administrators can create new tasks.", "warning");
      return;
    }
    if (!title.trim()) return;

    setLoading(true);
    const bodyData = { 
      title, 
      description, 
      priority, 
      assignedUser: assignedUser.trim() || "Jiya Vinchhi" 
    };

    if (useFallback) {
      const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id || 0)) + 1 : 1,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        assignedUser: bodyData.assignedUser,
        createdAt: new Date().toISOString()
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updated));
      
      // Fallback simulated background event
      const apiTime = new Date().toISOString();
      setTimeout(() => {
        setEventLogs(prev => [
          {
            id: `evt_${Date.now()}`,
            eventType: 'task-created',
            taskTitle: newTask.title,
            assignedUser: newTask.assignedUser,
            apiResponseTime: apiTime,
            handlerFinishTime: new Date().toISOString(),
            elapsedFromApiMs: 1500,
            delayMs: 1500,
            status: 'completed',
            message: `(Fallback) Notification dispatched for "${newTask.title}"`
          },
          ...prev
        ]);
      }, 1500);

      showToast("Task added locally (Fallback mode)!");
      setLoading(false);
    } else {
      try {
        const response = await fetch(`${serverUrl}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => [data, ...prev]);
          showToast(`Task created! Background notification queued for ${bodyData.assignedUser}`);
          fetchEventLogs();
          // Poll again after simulated delay finishes
          setTimeout(fetchEventLogs, 2300);
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
    setAiSuggestionMeta(null);
  };

  // Toggle Complete Task (PUT)
  const handleToggleComplete = async (task) => {
    if (!isAdmin) {
      showToast("Read-only mode: Verified completed tasks cannot be modified.", "warning");
      return;
    }

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
        const response = await fetch(`${serverUrl}/tasks/${targetId}`, {
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
    if (!isAdmin) {
      showToast("Read-only mode: Only administrators can delete tasks.", "warning");
      return;
    }

    if (useFallback) {
      const target = tasks.find(t => t.id === id);
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem("portfolio_tasks", JSON.stringify(updatedTasks));
      showToast("Task deleted from local workspace.");
      if (target) {
        setEventLogs(prev => [
          {
            id: `evt_${Date.now()}`,
            eventType: 'task-deleted',
            taskTitle: target.title,
            assignedUser: target.assignedUser || 'Jiya Vinchhi',
            apiResponseTime: new Date().toISOString(),
            handlerFinishTime: new Date().toISOString(),
            elapsedFromApiMs: 10,
            delayMs: 0,
            status: 'completed',
            message: `(Fallback) Deletion audit completed for "${target.title}"`
          },
          ...prev
        ]);
      }
    } else {
      try {
        const response = await fetch(`${serverUrl}/tasks/${id}`, {
          method: "DELETE"
        });
        const data = await response.json();
        if (response.ok) {
          setTasks(prev => prev.filter(t => t._id !== id && t.id !== id));
          showToast("Task removed from MongoDB.");
          fetchEventLogs();
          setTimeout(fetchEventLogs, 800);
        } else {
          showToast(data.message || "Failed to delete task.", "error");
        }
      } catch (err) {
        showToast("Error connecting to server.", "error");
      }
    }
  };

  // Simulate Safe Error in EventEmitter
  const handleSimulateError = async () => {
    if (!backendOnline) {
      showToast("Backend must be online to test safe EventEmitter error handling.", "warning");
      return;
    }
    try {
      const res = await fetch(`${serverUrl}/debug/events/simulate-error`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "UI Triggered Listener Exception Test" })
      });
      if (res.ok) {
        showToast("Safe error emitted! Server process handled exception safely.", "success");
        fetchEventLogs();
      }
    } catch (e) {
      showToast("Failed to communicate with debug endpoint.", "error");
    }
  };

  // Clear Event History Buffer
  const handleClearEvents = async () => {
    if (!backendOnline) {
      setEventLogs([]);
      showToast("Event stream cleared.");
      return;
    }
    try {
      await fetch(`${serverUrl}/debug/events/clear`, { method: "POST" });
      setEventLogs([]);
      showToast("Event buffer cleared on server.");
    } catch (e) {
      showToast("Failed to clear event logs.", "error");
    }
  };

  // Filter tasks to ensure only tasks related to the 4 projects are shown
  const projectTasks = tasks.filter(t => /siyarang|resumefit|finlite|formflux/i.test(t.title));
  const effectiveBaseTasks = projectTasks.length > 0 ? projectTasks : default4ProjectTasks;

  // Completed Tasks for Public View
  const publicCompletedTasks = effectiveBaseTasks.filter(t => t.completed);
  const effectivePublicTasks = publicCompletedTasks.length > 0 
    ? publicCompletedTasks 
    : defaultCompletedShowcaseTasks;

  const currentWorkspaceTasks = isAdmin ? effectiveBaseTasks : effectivePublicTasks;

  // Stats Calculations
  const totalCount = currentWorkspaceTasks.length;
  const completedCount = currentWorkspaceTasks.filter(t => t.completed).length;
  const pendingCount = isAdmin ? currentWorkspaceTasks.filter(t => !t.completed).length : 0;
  const highPriorityCount = currentWorkspaceTasks.filter(t => t.priority === "high").length;

  // Filter Tasks
  const filteredTasks = currentWorkspaceTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !isAdmin || statusFilter === "all" || 
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
          <h1 
            style={isThemeApplied && appliedTheme?.fonts?.heading ? { fontFamily: appliedTheme.fonts.heading } : {}}
            className="text-3xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight"
          >
            Creative Task Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            A premium full-stack dashboard demonstrating reactive state management, asynchronous data fetching, and Mongoose database model schemas.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* AI-Assisted UI Design Suggestion Button */}
          <button
            onClick={fetchDesignSuggestion}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 transition shadow-lg shadow-purple-500/25"
            title="Get AI UI Design recommendations"
          >
            <FiZap className={loadingDesign ? "animate-spin" : ""} />
            <span>{loadingDesign ? "Generating..." : "✨ Get AI Design Suggestion"}</span>
          </button>

          {isThemeApplied && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>AI Theme Active</span>
              <button
                onClick={resetAiDesign}
                className="ml-1 text-[11px] underline hover:text-indigo-800 dark:hover:text-indigo-200"
                title="Reset to default theme"
              >
                Reset
              </button>
            </div>
          )}

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

      {/* Access Mode Banner (Public Read-Only vs Admin Mode) */}
      {!isAdmin ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/5 border border-blue-500/25 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white text-lg shrink-0 shadow-md">
              <FiShield />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Public Showcase Mode — Verified Completed Deliverables</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                You are viewing completed engineering tasks and technical deliverables in read-only mode. Task creation, editing, and status management are restricted to the Admin Workspace.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="shrink-0 px-4 py-2 text-xs font-bold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md transition hover:scale-105 flex items-center gap-1.5"
          >
            <FiLock className="text-xs" /> Admin Sign In
          </Link>
        </div>
      ) : (
        <div className="p-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
            <FiCheckCircle className="text-base text-emerald-500 shrink-0" />
            <span><strong>Admin Workspace Active:</strong> Full CRUD operations, task editing modal, and real-time EventEmitter status toggling enabled.</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
            Admin Mode
          </span>
        </div>
      )}

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
      <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          <div className="text-sm">
            Database: <span className="font-semibold">{backendOnline ? "Connected (MongoDB)" : "Offline (Local)"}</span>
          </div>
        </div>

        {/* Blue-Green Deployment Interactive Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Traffic Route:</span>
          <div className="flex items-center p-1 rounded-xl bg-slate-200/50 dark:bg-white/10 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => switchBlueGreen("http://localhost:5000")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                serverUrl === "http://localhost:5000"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-500"
              }`}
              title="Route traffic to Blue production container on port 5000"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
              Blue (5000)
            </button>
            <button
              type="button"
              onClick={() => switchBlueGreen("http://localhost:5001")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                serverUrl === "http://localhost:5001"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-500"
              }`}
              title="Route traffic to Green staging container on port 5001"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Green (5001)
            </button>
          </div>
          {backendOnline && (
            <button
              onClick={() => {
                setUseFallback(!useFallback);
                showToast(useFallback ? "Connected to MongoDB." : "Forced local fallback mode.", "warning");
              }}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition text-slate-700 dark:text-slate-300"
            >
              {useFallback ? "Mongoose" : "Offline Mode"}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            {isAdmin ? "Total Tasks" : "Deliverables"}
          </span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            {isAdmin ? "Completed" : "Verified Deliverables"}
          </span>
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            {isAdmin ? "Pending" : "Completion Rate"}
          </span>
          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {isAdmin ? pendingCount : "100%"}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">High Priority</span>
          <span className="text-3xl font-extrabold text-red-500">{highPriorityCount}</span>
        </div>
      </div>

      {/* Main Workspace Dashboard */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls / Overview (Grid: 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {isAdmin ? (
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FiServer className="text-blue-500" /> New Task
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Admin
                </span>
              </div>

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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={isGeneratingAi || !title.trim()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      title={title.trim() ? "Generate description & suggest priority using AI" : "Enter a task title first"}
                    >
                      <FiCpu className={isGeneratingAi ? "animate-spin" : ""} />
                      {isGeneratingAi ? "Generating..." : "✨ AI Assist"}
                    </button>
                  </div>
                  <textarea
                    placeholder="Describe details of the task or click '✨ AI Assist'..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                  />
                  
                  {/* Responsible AI Disclaimer & Metadata Banner */}
                  {aiSuggestionMeta && (
                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex flex-col gap-1 transition-all">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1 text-[11px]">
                          <FiCpu className="text-purple-500" />
                          Source: {aiSuggestionMeta.source === "openai" ? "OpenAI GPT-4o-mini" : aiSuggestionMeta.source === "gemini" ? "Google Gemini 1.5" : "Graceful Fallback Engine"}
                        </span>
                        {aiSuggestionMeta.suggestedPriority && (
                          <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 font-bold">
                            Suggested: {aiSuggestionMeta.suggestedPriority}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        ⚠️ <strong>Responsible AI:</strong> Suggestion is an editable machine draft. Review before submitting. Never send credentials or personal data.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FiUser className="text-blue-500" /> Assigned User (Event Payload)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jiya Vinchhi"
                    value={assignedUser}
                    onChange={(e) => setAssignedUser(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                  style={isThemeApplied && appliedTheme?.colors?.primary ? { backgroundColor: appliedTheme.colors.primary } : {}}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/10"
                >
                  <FiPlus /> Create Task (Triggers Event)
                </button>
              </form>
            </div>
          ) : (
            /* PUBLIC MODE: Deliverables Showcase Summary Card */
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FiShield className="text-emerald-500" /> Deliverables Space
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <FiLock className="text-[10px]" /> Public Link
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This public interface displays all <strong>verified engineering milestones</strong> and deliverables created for this project. Task editing, status toggling, deletion, and AI generation are protected operations accessible only via the Admin Workspace.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 flex flex-col gap-2.5 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-500" /> Verified Milestones
                </span>
                <ul className="flex flex-col gap-2 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>SiyaRang:</strong> Catalog Architecture & Order Pipeline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>ResumeFit:</strong> Semantic Fit Scoring & Supabase DB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>FinLite:</strong> PDF Balance Sheet & Predictive Analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span><strong>FormFlux:</strong> Dynamic Schema DB & Live XLSX Tracker</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Need to add, edit, or manage tasks?
                </span>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition hover:scale-[1.02]"
                >
                  <FiLock /> Sign In to Admin Workspace
                </Link>
              </div>
            </div>
          )}

          {/* Architecture Badge Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/20 backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <FiZap className="text-amber-500" /> Async EventEmitter Active
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              API responds with <strong>201 Created</strong> immediately in ~20ms, while background listeners dispatch notifications asynchronously after response transmission.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-blue-500/10 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Non-blocking Node.js native events
              </span>
              <span className="text-blue-500 font-semibold">{eventLogs.length} events logged</span>
            </div>
          </div>

          {/* Responsible AI & LLM Service Integration Card (Practical 13) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-blue-500/10 border border-purple-500/20 backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              <FiCpu className="text-purple-500" /> External AI Integration (Practical 13)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Integrates <strong>OpenAI GPT-4o-mini</strong> and <strong>Google Gemini</strong> via isolated backend proxy (<code className="text-purple-600 dark:text-purple-300 font-mono text-[11px]">/api/ai/generate-description</code>). Features <strong>Graceful Degradation</strong> and <strong>Sliding Rate-Limiting</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-400 pt-1 border-t border-purple-500/10">
              <span className="flex items-center gap-1">🔒 Key: Server .env Only</span>
              <span className="flex items-center gap-1">🛡️ Graceful Fallback</span>
              <span className="flex items-center gap-1">⏱️ 15s Per-Task Cooldown</span>
              <span className="flex items-center gap-1">✍️ Editable AI Drafts</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Task Dashboard & Event Stream (Grid: 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Tab Navigation Switcher */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "tasks"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <FiGrid className="text-sm" /> Tasks Workspace ({filteredTasks.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("events");
                  fetchEventLogs();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "events"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <FiActivity className="text-sm" /> Async Event Stream ({eventLogs.length})
              </button>
            </div>

            {activeTab === "events" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateError}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition border border-red-500/20"
                  title="Test safe EventEmitter error handler without crashing server"
                >
                  <FiShield className="text-xs" /> Simulate Safe Error
                </button>
                <button
                  onClick={fetchEventLogs}
                  className="p-1.5 text-xs rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                  title="Refresh event stream"
                >
                  <FiRotateCw />
                </button>
                <button
                  onClick={handleClearEvents}
                  className="p-1.5 text-xs rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                  title="Clear event history"
                >
                  <FiTrash2 />
                </button>
              </div>
            )}
          </div>

          {activeTab === "tasks" ? (
            <>
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
                  {isAdmin ? (
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <select
                      value="completed"
                      disabled
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 cursor-not-allowed outline-none"
                    >
                      <option value="completed">Completed Tasks (Read Only)</option>
                    </select>
                  )}

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
                            {isAdmin ? (
                              <button
                                onClick={() => handleToggleComplete(task)}
                                className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 transition-all duration-300 ${
                                  task.completed
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-slate-300 dark:border-white/20 text-transparent hover:border-blue-500 hover:scale-105"
                                }`}
                                title={task.completed ? "Mark as pending" : "Mark as completed"}
                              >
                                <FiCheck className="stroke-[3]" />
                              </button>
                            ) : (
                              <div
                                className="mt-1 w-6 h-6 rounded-full bg-emerald-600 border border-emerald-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm"
                                title="Verified completed deliverable (read-only)"
                              >
                                <FiCheck className="stroke-[3]" />
                              </div>
                            )}
                            
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-base font-bold transition-all duration-300 ${
                                  isAdmin && task.completed 
                                    ? "line-through text-slate-400 dark:text-slate-500" 
                                    : "text-slate-900 dark:text-white"
                                }`}>
                                  {task.title}
                                </span>
                                {!isAdmin && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                                    ✓ Completed
                                  </span>
                                )}
                              </div>
                              
                              {task.description && (
                                <p className={`text-sm mt-1 leading-relaxed ${
                                  isAdmin && task.completed 
                                    ? "text-slate-400/80 dark:text-slate-600" 
                                    : "text-slate-600 dark:text-slate-300"
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

                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md font-mono text-[9px] flex items-center gap-1 font-semibold">
                                  <FiUser className="text-[10px]" /> {task.assignedUser || 'Jiya Vinchhi'}
                                </span>
                                
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-md font-mono text-[9px] text-slate-400 dark:text-slate-500">
                                  REF: {taskId}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isAdmin ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-300 opacity-80 hover:opacity-100 scale-95 hover:scale-100"
                                title="Edit task details"
                              >
                                <FiEdit2 className="text-base" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(taskId)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 opacity-80 hover:opacity-100 scale-95 hover:scale-100"
                                title="Delete task (emits task-deleted event)"
                              >
                                <FiTrash2 className="text-base" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-1 text-slate-400 shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 font-mono text-[10px]"
                              title="Read-only deliverable"
                            >
                              <FiLock className="text-xs text-slate-400" />
                              <span className="hidden sm:inline">Locked</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* ASYNC EVENT STREAM VIEW */
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
                <FiZap className="text-blue-500 text-lg shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Event-Driven Asynchronous Non-Blocking Architecture
                  </span>
                  <p className="leading-relaxed">
                    When tasks are created, the HTTP API sends <strong>201 Created</strong> in ~20ms, immediately decoupling execution. The notification listener executes in the background ~2000ms later on Node's Event Loop without delaying client I/O.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1">
                {eventLogs.length === 0 ? (
                  <div className="text-center py-16 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-slate-400">
                    <FiActivity className="text-3xl mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No background events recorded yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Create a new task or click "Simulate Safe Error" to generate events!</p>
                  </div>
                ) : (
                  eventLogs.map((evt) => (
                    <motion.div
                      layout
                      key={evt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col gap-3 transition-all ${
                        evt.eventType === 'task-error'
                          ? 'bg-red-500/5 border-red-500/20'
                          : evt.eventType === 'task-deleted'
                          ? 'bg-purple-500/5 border-purple-500/20'
                          : 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            evt.eventType === 'task-error'
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : evt.eventType === 'task-deleted'
                              ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {evt.eventType}
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {evt.taskTitle}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {evt.status}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <FiClock className="text-emerald-500" /> API Response Sent (Instant)
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 text-[11px] truncate">
                            {evt.apiResponseTime ? evt.apiResponseTime.split('T')[1].replace('Z','') : 'Immediate'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <FiZap className="text-blue-500" /> Background Listener Executed
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 text-[11px] truncate">
                            {evt.handlerFinishTime ? evt.handlerFinishTime.split('T')[1].replace('Z','') : 'In Progress'} 
                            <span className="ml-1 text-blue-500 font-bold">(+{evt.elapsedFromApiMs}ms)</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <FiUser className="text-slate-400" /> Assigned: <strong>{evt.assignedUser}</strong>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {evt.message || `Processed after ${evt.delayMs}ms background delay`}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Admin Edit Task Modal */}
      <AnimatePresence>
        {isAdmin && editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col gap-5 text-slate-800 dark:text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white text-lg">
                    <FiEdit2 />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Edit Task (Admin Workspace)</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update task details, description, status, and priority
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTask(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                    >
                      <option value="low" className="text-slate-800 bg-white">Low</option>
                      <option value="medium" className="text-slate-800 bg-white">Medium</option>
                      <option value="high" className="text-slate-800 bg-white">High</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Assigned User
                    </label>
                    <input
                      type="text"
                      value={editForm.assignedUser}
                      onChange={(e) => setEditForm(prev => ({ ...prev, assignedUser: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="edit-completed"
                    checked={editForm.completed}
                    onChange={(e) => setEditForm(prev => ({ ...prev, completed: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="edit-completed" className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                    Task Completed
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 dark:border-white/10 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Design Suggestion Modal (Practical 15 / Assignment 7) */}
      <AnimatePresence>
        {aiDesignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5 text-slate-800 dark:text-slate-100"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 text-white text-lg">
                    <FiSliders />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      AI-Assisted UI Design Suggestions
                      {designSuggestion && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                          {designSuggestion.source || "AI Generated"}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Prompt engineered design system recommendations with WCAG contrast evaluation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAiDesignModalOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Loading State */}
              {loadingDesign && (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <FiRotateCw className="text-3xl text-indigo-500 animate-spin" />
                  <p className="text-sm font-semibold">Generating customized UI suggestions with AI...</p>
                  <p className="text-xs text-slate-400">Analyzing contrast ratios, typography pairings, and layout efficiency</p>
                </div>
              )}

              {/* Suggestions Loaded */}
              {!loadingDesign && designSuggestion && (
                <div className="flex flex-col gap-5">
                  {/* Color Scheme Section */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <FiEye className="text-indigo-500" /> Suggested Color Scheme
                      </span>
                      {/* Contrast Ratio Badge (Responsible AI) */}
                      {(() => {
                        const bg = designSuggestion.colors?.background || '#0f172a';
                        const primary = designSuggestion.colors?.primary || '#6366f1';
                        const ratio = getContrastRatio(primary, bg);
                        const isSafe = ratio >= 4.5;
                        return (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isSafe
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            }`}
                          >
                            Contrast: {ratio}:1 {isSafe ? "✓ WCAG AA Pass" : "⚠️ Needs Review"}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(designSuggestion.colors || {}).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200/60 dark:border-white/5">
                          <span
                            className="w-7 h-7 rounded-lg shadow-inner shrink-0 border border-black/10"
                            style={{ backgroundColor: val }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 truncate">{key}</span>
                            <span className="text-xs font-mono font-semibold truncate">{val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Font Pairing Section */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FiCode className="text-purple-500" /> Typography & Font Pairing
                    </span>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white dark:bg-black/20 border border-slate-200/60 dark:border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Heading Font</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {designSuggestion.fonts?.heading || "Outfit, Space Grotesk"}
                        </span>
                        <span className="text-[11px] text-slate-500 italic mt-1">
                          "High readability and modern aesthetic for task titles"
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-black/20 border border-slate-200/60 dark:border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Body Font</span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {designSuggestion.fonts?.body || "Inter, Sora"}
                        </span>
                        <span className="text-[11px] text-slate-500 italic mt-1">
                          "Clean geometric sans-serif optimized for density"
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Layout Tip Section */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FiLayout className="text-pink-500" /> Actionable Layout Improvement
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      💡 {designSuggestion.layoutTip || "Organize tasks by status and priority with high-contrast badge indicators."}
                    </p>
                  </div>

                  {/* Responsible AI Disclaimer Banner */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                    <FiAlertTriangle className="text-amber-500 shrink-0 text-base mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[11px]">Responsible AI Governance (Human-in-the-Loop):</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                        Always evaluate AI output prior to committing to production. Contrast ratios must meet WCAG 2.1 AA standards (minimum 4.5:1) to ensure full accessibility for users with visual impairments.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetAiDesign}
                        className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 dark:border-white/10 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                      >
                        Reset Theme
                      </button>
                      <button
                        onClick={fetchDesignSuggestion}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 transition flex items-center gap-1"
                      >
                        <FiRotateCw /> Regenerate
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        applyAiDesign(designSuggestion);
                        setAiDesignModalOpen(false);
                      }}
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white transition shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
                    >
                      <FiCheckCircle /> Apply AI Design to UI
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
