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

  // Test 8: AI Integration - POST /api/ai/generate-description without title returns 400
  test('POST /api/ai/generate-description without title returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Content-Type', 'application/json')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Bad Request');
  });

  // Test 9: AI Integration - POST /api/ai/generate-description generates description & disclaimer
  test('POST /api/ai/generate-description generates description with disclaimer', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Content-Type', 'application/json')
      .send({ title: 'Implement JWT Authentication with Refresh Tokens' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('description');
    expect(typeof res.body.description).toBe('string');
    expect(res.body.description.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('suggestedPriority');
    expect(res.body).toHaveProperty('disclaimer');
  });

  // Test 10: AI Integration - Rate limiting returns 429 on rapid consecutive duplicate requests
  test('POST /api/ai/generate-description returns 429 on rapid identical requests', async () => {
    const testTitle = 'Rate Limit Probe Task ' + Date.now();
    // First request should succeed
    const firstRes = await request(app)
      .post('/api/ai/generate-description')
      .set('Content-Type', 'application/json')
      .send({ title: testTitle });
    expect(firstRes.statusCode).toBe(200);

    // Second immediate request with same title must trigger rate limiting
    const secondRes = await request(app)
      .post('/api/ai/generate-description')
      .set('Content-Type', 'application/json')
      .send({ title: testTitle });
    expect(secondRes.statusCode).toBe(429);
    expect(secondRes.body).toHaveProperty('error', 'Too Many Requests');
  });

  // Test 11: Richardson Maturity Level 2 - POST /tasks returns 201 Created and sets Location header
  test('POST /tasks returns 201 Created and sets Location header (Level 2)', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send({
        title: 'Richardson Level 2 Verification Task ' + Date.now(),
        priority: 'high'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.headers).toHaveProperty('location');
    expect(res.headers.location).toContain('/tasks/');
  });

  // Test 12: Richardson Maturity Level 3 - GET /tasks/:id/hateoas returns hypermedia _links (HATEOAS)
  test('GET /tasks/:id/hateoas returns HATEOAS hypermedia links (Level 3)', async () => {
    // First create a task
    const createRes = await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send({
        title: 'HATEOAS Verification Task ' + Date.now(),
        priority: 'medium'
      });
    const createdId = createRes.body._id;

    const res = await request(app).get(`/tasks/${createdId}/hateoas`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_links');
    expect(res.body._links).toHaveProperty('self');
    expect(res.body._links).toHaveProperty('update');
    expect(res.body._links).toHaveProperty('delete');
    expect(res.body._links).toHaveProperty('collection');
    expect(res.body._links.self.href).toContain(`/tasks/${createdId}`);
  });

  // Cleanup: Close Mongoose database connection so Jest finishes cleanly
  afterAll(async () => {
    await mongoose.connection.close();
  });
});

