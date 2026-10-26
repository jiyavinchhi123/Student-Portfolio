const EventEmitter = require('events');

/**
 * Dedicated EventEmitter module for asynchronous background processing.
 * Extends Node.js native EventEmitter without external dependencies.
 */
class TaskEvents extends EventEmitter {}

// Export a singleton instance of TaskEvents
const taskEvents = new TaskEvents();

// By default in Node.js, emitting an 'error' event without any listener throws an uncaught exception.
// Registering a base 'error' listener ensures server stability and resilience against listener faults.
taskEvents.on('error', (err) => {
  console.error(`[EventEmitter:Error] Safe error trap caught an event failure at ${new Date().toISOString()}:`, err.message || err);
});

module.exports = taskEvents;
