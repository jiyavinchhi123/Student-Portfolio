const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Task Manager REST API & Middleware Suite (CI/CD Automated Tests)', () => {

  // Test 1: GET /tasks returns 200 (Matches lab specification)
  test('GET /tasks returns status 200 and JSON array', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 2: In-Memory Caching inspection endpoint
  test('GET /debug/cache returns 200 with cache statistics', async () => {
    const res = await request(app).get('/debug/cache');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'active');
    expect(res.body).toHaveProperty('hits');
    expect(res.body).toHaveProperty('misses');
  });

  // Test 3: Background EventEmitter inspection endpoint
  test('GET /tasks/events/log returns 200 with EventEmitter status', async () => {
    const res = await request(app).get('/tasks/events/log');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'active');
    expect(res.body).toHaveProperty('subsystem');
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  // Test 4: Content-Type Middleware Verification (Rejects non-JSON POST)
  test('POST /tasks without application/json returns 400 or 415', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Content-Type', 'text/plain')
      .send('Invalid string body');
    expect([400, 415]).toContain(res.statusCode);
  });

  // Test 5: Validation - POST /tasks without title returns 400 Bad Request
  test('POST /tasks without title returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send({ description: 'Missing title' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Bad Request');
  });

  // Test 6: 404 Catch-All Route Handling
  test('GET /undefined-route returns 404 Not Found', async () => {
    const res = await request(app).get('/undefined-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });

  // Test 7: Global Error Handling Middleware
  test('GET /trigger-error triggers 500 Internal Server Error safely', async () => {
    const res = await request(app).get('/trigger-error');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
  });

  // Cleanup: Close Mongoose database connection so Jest finishes cleanly
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
