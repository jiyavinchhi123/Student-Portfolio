/**
 * Database Seed Script for Load Testing (Practical 10 / Assignment 3)
 * Populates MongoDB with 50 realistic task records to ensure realistic
 * query payload sizes and database I/O during Apache Bench load testing.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager';

const SAMPLE_TITLES = [
  "Configure Docker Compose for Microservices",
  "Implement JWT Authentication with Refresh Tokens",
  "Design Dynamic UI with TailwindCSS & Framer Motion",
  "Optimize MongoDB Query Indexes for Compound Searches",
  "Implement In-Memory Caching using node-cache",
  "Configure GitHub Actions CI/CD Pipeline",
  "Audit RESTful API against Richardson Maturity Model",
  "Apply STRIDE Threat Model to Task Service",
  "Enable Local HTTPS and TLS Encryption with mkcert",
  "Sanitize Request Payloads against NoSQL Injection",
  "Solve Binary Tree Zigzag Level Order Traversal",
  "Analyze Time and Space Complexity for Graph BFS",
  "Configure Automated Integration Tests with Jest & Supertest",
  "Set up Prometheus and Grafana Metric Dashboards",
  "Implement WebSocket Real-Time Task Synchronization",
  "Design Responsive Navigation Menu for Mobile Devices",
  "Write Disaster Recovery and Automated Backup Playbooks",
  "Optimize Webpack / Vite Production Bundle Sizes",
  "Implement Asynchronous Background Notifications with EventEmitter",
  "Integrate OpenAI GPT-4o-mini for Automated Description Generation",
  "Review OWASP Top 10 Vulnerability Checklists",
  "Configure Redis Distributed Cache for High-Concurrency Clusters",
  "Implement Zero-Downtime Rolling Deployment with Kubernetes",
  "Configure NGINX Reverse Proxy and Rate Limiting",
  "Refactor Legacy Callbacks to Async/Await Pipelines"
];

const CATEGORIES = ["Learning", "Deadline", "Personal", "DSA"];
const PRIORITIES = ["low", "medium", "high"];
const USERS = ["Jiya Vinchhi", "Dev Team", "System Admin", "QA Engineer"];

async function seedTasks() {
  console.log("====================================================");
  console.log("  SEEDING 50 TASKS FOR LOAD TESTING BENCHMARK");
  console.log("====================================================");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB:", MONGO_URI);

    // Count existing tasks
    const existingCount = await Task.countDocuments();
    console.log(`Current task count in database: ${existingCount}`);

    // If already seeded with 50+ tasks, inform user
    if (existingCount >= 50) {
      console.log(`Database already has ${existingCount} tasks (>= 50 required).`);
      console.log("Seeding additional records to refresh dataset...");
    }

    const tasksToInsert = [];
    for (let i = 1; i <= 50; i++) {
      const titleBase = SAMPLE_TITLES[(i - 1) % SAMPLE_TITLES.length];
      const category = CATEGORIES[i % CATEGORIES.length];
      const priority = PRIORITIES[i % PRIORITIES.length];
      const assignedUser = USERS[i % USERS.length];
      const isCompleted = i % 3 === 0;

      tasksToInsert.push({
        title: `${titleBase} (Batch #${i})`,
        description: `Comprehensive implementation and verification guidelines for milestone #${i}. Requires thorough integration testing and security review.`,
        completed: isCompleted,
        priority: priority,
        category: category,
        dueDate: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        assignedUser: assignedUser
      });
    }

    // Insert new batch of 50 tasks
    const result = await Task.insertMany(tasksToInsert);
    const totalCount = await Task.countDocuments();
    console.log(`Successfully seeded ${result.length} tasks!`);
    console.log(`Total tasks now available in MongoDB: ${totalCount}`);
    console.log("Dataset is primed for Apache Bench (ab) load testing.\n");

  } catch (err) {
    console.error("Error seeding tasks:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

if (require.main === module) {
  seedTasks();
}

module.exports = seedTasks;
