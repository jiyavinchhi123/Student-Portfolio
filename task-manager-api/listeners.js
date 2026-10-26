const taskEvents = require('./events');

/**
 * In-memory buffer to store the last 50 processed background events.
 * Enables live inspection in both the automated benchmark suite and the frontend UI.
 */
const eventHistory = [];
const MAX_HISTORY = 50;

// Configurable simulated delay in milliseconds (default: 2000ms as required by supplementary problem)
let simulatedDelayMs = 2000;

function recordEvent(eventData) {
  eventHistory.unshift(eventData);
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.pop();
  }
}

/**
 * 1. Listener for 'task-created'
 * Triggered asynchronously after the POST /tasks route returns 201 to the client.
 */
taskEvents.on('task-created', (payload) => {
  const task = payload.task || payload;
  const apiResponseTime = payload.apiResponseTime || new Date().toISOString();
  const handlerStartTime = new Date().toISOString();

  console.log(`[Notification:Queued] Background task-created event received at ${handlerStartTime}`);
  console.log(`  └─ Task: "${task.title}" (ID: ${task._id || task.id || 'N/A'})`);
  console.log(`  └─ Assigned User: ${task.assignedUser || 'Jiya Vinchhi'}`);
  console.log(`  └─ Note: API already returned 201 Created at ${apiResponseTime}`);

  // Simulate slow asynchronous notification dispatch (e.g. Email / Push / Webhook delivery)
  setTimeout(() => {
    try {
      const handlerFinishTime = new Date().toISOString();
      const elapsedFromApi = new Date(handlerFinishTime) - new Date(apiResponseTime);

      console.log(`[Notification:Executed] Task "${task.title}" processed at ${handlerFinishTime}`);
      console.log(`  └─ Timestamp: ${handlerFinishTime}`);
      console.log(`  └─ Assigned to: ${task.assignedUser || 'Jiya Vinchhi'}`);
      console.log(`  └─ Turnaround: Handled asynchronously +${elapsedFromApi}ms after API response sent.`);

      recordEvent({
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        eventType: 'task-created',
        taskId: task._id || task.id,
        taskTitle: task.title,
        assignedUser: task.assignedUser || 'Jiya Vinchhi',
        apiResponseTime,
        handlerStartTime,
        handlerFinishTime,
        elapsedFromApiMs: elapsedFromApi,
        delayMs: simulatedDelayMs,
        status: 'completed',
        message: `Notification dispatched for "${task.title}" to ${task.assignedUser || 'Jiya Vinchhi'}`
      });
    } catch (err) {
      taskEvents.emit('error', err);
    }
  }, simulatedDelayMs);
});

/**
 * 2. Supplementary Problem: Listener for 'task-deleted'
 * Triggered after DELETE /tasks/:id completes and responds to the client.
 */
taskEvents.on('task-deleted', (payload) => {
  const task = payload.task || payload;
  const apiResponseTime = payload.apiResponseTime || new Date().toISOString();
  const handlerStartTime = new Date().toISOString();

  console.log(`[Notification:Deleted] Background task-deleted event received at ${handlerStartTime}`);
  console.log(`  └─ Deleted Task: "${task.title || 'Untitled'}" (ID: ${task._id || task.id || payload.taskId})`);
  console.log(`  └─ Assigned User: ${task.assignedUser || 'Jiya Vinchhi'}`);

  // Simulating asynchronous deletion audit log / cleanup
  setTimeout(() => {
    try {
      const handlerFinishTime = new Date().toISOString();
      const elapsedFromApi = new Date(handlerFinishTime) - new Date(apiResponseTime);

      console.log(`[Notification:Audit] Deletion audit completed at ${handlerFinishTime} (+${elapsedFromApi}ms)`);

      recordEvent({
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        eventType: 'task-deleted',
        taskId: task._id || task.id || payload.taskId,
        taskTitle: task.title || 'Deleted Task',
        assignedUser: task.assignedUser || 'Jiya Vinchhi',
        apiResponseTime,
        handlerStartTime,
        handlerFinishTime,
        elapsedFromApiMs: elapsedFromApi,
        delayMs: Math.min(simulatedDelayMs, 500),
        status: 'completed',
        message: `Deletion record archived for "${task.title || 'Task'}"`
      });
    } catch (err) {
      taskEvents.emit('error', err);
    }
  }, Math.min(simulatedDelayMs, 500));
});

/**
 * 3. Supplementary Problem: Listener for simulated error demonstration
 * Demonstrates catching errors thrown inside background listeners.
 */
taskEvents.on('task-error-test', (payload) => {
  console.log(`[Notification:ErrorTest] Simulated background error event triggered at ${new Date().toISOString()}`);
  try {
    throw new Error(payload.message || "Simulated unhandled exception inside event listener!");
  } catch (err) {
    console.warn(`[Notification:ErrorTest] Caught internal error, routing to EventEmitter error listener...`);
    taskEvents.emit('error', err);
    recordEvent({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventType: 'task-error',
      taskTitle: 'Error Simulation',
      assignedUser: 'System',
      apiResponseTime: payload.apiResponseTime || new Date().toISOString(),
      handlerStartTime: new Date().toISOString(),
      handlerFinishTime: new Date().toISOString(),
      elapsedFromApiMs: 0,
      delayMs: 0,
      status: 'error-handled',
      message: err.message
    });
  }
});

module.exports = {
  getEventHistory: () => [...eventHistory],
  clearEventHistory: () => { eventHistory.length = 0; },
  setSimulatedDelayMs: (ms) => { simulatedDelayMs = ms; },
  getSimulatedDelayMs: () => simulatedDelayMs
};
