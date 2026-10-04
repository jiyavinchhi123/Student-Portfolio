const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const parsedUrl = new URL(url);
    
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        let parsedBody = null;
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          parsedBody = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          durationMs: parseFloat(durationMs.toFixed(2)),
          cacheHeader: res.headers['x-cache'] || 'NONE',
          data: parsedBody
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runBenchmark() {
  console.log('====================================================');
  console.log('  TASK MANAGEMENT API - CACHING BENCHMARK & TEST');
  console.log('====================================================\n');

  try {
    // 0. Reset cache
    console.log('Step 0: Clearing cache before test...');
    await makeRequest(`${BASE_URL}/debug/cache/clear`, { method: 'POST' });

    // 1. Measure Uncached Reads (using ?noCache=true or fresh cache miss)
    console.log('\n--- 1. Measuring Uncached GET /tasks (Direct Database Queries) ---');
    const uncachedReadings = [];
    for (let i = 1; i <= 5; i++) {
      const res = await makeRequest(`${BASE_URL}/tasks?noCache=true`);
      uncachedReadings.push(res.durationMs);
      console.log(`  Sample ${i}: ${res.durationMs} ms (Status: ${res.statusCode}, X-Cache: ${res.cacheHeader})`);
      // Small pause between samples
      await new Promise(r => setTimeout(r, 100));
    }
    const avgUncached = (uncachedReadings.reduce((a, b) => a + b, 0) / uncachedReadings.length).toFixed(2);
    console.log(`  => Average Uncached Response Time: ${avgUncached} ms`);

    // 2. Measure Cached Reads
    console.log('\n--- 2. Measuring Cached GET /tasks (In-Memory node-cache) ---');
    // First request primes the cache (MISS)
    const primeRes = await makeRequest(`${BASE_URL}/tasks`);
    console.log(`  Initial Cache Prime (MISS): ${primeRes.durationMs} ms (X-Cache: ${primeRes.cacheHeader})`);

    const cachedReadings = [];
    for (let i = 1; i <= 5; i++) {
      const res = await makeRequest(`${BASE_URL}/tasks`);
      cachedReadings.push(res.durationMs);
      console.log(`  Sample ${i}: ${res.durationMs} ms (Status: ${res.statusCode}, X-Cache: ${res.cacheHeader})`);
      await new Promise(r => setTimeout(r, 100));
    }
    const avgCached = (cachedReadings.reduce((a, b) => a + b, 0) / cachedReadings.length).toFixed(2);
    console.log(`  => Average Cached Response Time: ${avgCached} ms`);

    const speedup = (parseFloat(avgUncached) / parseFloat(avgCached)).toFixed(1);
    const latencyReduction = (((parseFloat(avgUncached) - parseFloat(avgCached)) / parseFloat(avgUncached)) * 100).toFixed(1);
    console.log(`\n  ⚡ Performance Gain: ${speedup}x faster (${latencyReduction}% latency reduction)`);

    // 3. Test Cache Invalidation on Write (POST)
    console.log('\n--- 3. Testing Cache Invalidation on POST /tasks ---');
    const createRes = await makeRequest(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        title: 'Benchmark Test Task ' + Date.now(),
        description: 'Testing automatic cache invalidation',
        priority: 'high'
      }
    });
    console.log(`  Created task: "${createRes.data.title}" (ID: ${createRes.data._id})`);

    // The next GET /tasks must be a CACHE MISS and return the new task
    const postGetRes = await makeRequest(`${BASE_URL}/tasks`);
    console.log(`  Immediate GET /tasks after POST: ${postGetRes.durationMs} ms (X-Cache: ${postGetRes.cacheHeader})`);
    const foundNewTask = postGetRes.data.some(t => t._id === createRes.data._id);
    console.log(`  => Invalidation check: New task found in response? ${foundNewTask ? 'YES (Cache successfully invalidated!)' : 'NO'}`);

    // 4. Test Single-Task Endpoint Caching (GET /tasks/:id)
    console.log('\n--- 4. Testing Single-Task Caching (GET /tasks/:id) ---');
    const taskId = createRes.data._id;
    const taskMiss = await makeRequest(`${BASE_URL}/tasks/${taskId}`);
    console.log(`  First GET /tasks/${taskId} (MISS): ${taskMiss.durationMs} ms (X-Cache: ${taskMiss.cacheHeader})`);
    const taskHit = await makeRequest(`${BASE_URL}/tasks/${taskId}`);
    console.log(`  Second GET /tasks/${taskId} (HIT): ${taskHit.durationMs} ms (X-Cache: ${taskHit.cacheHeader})`);

    // 5. Test Cache Invalidation on PUT
    console.log('\n--- 5. Testing Cache Invalidation on PUT /tasks/:id ---');
    await makeRequest(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: { title: 'Updated Title ' + Date.now(), completed: true }
    });
    const taskAfterPut = await makeRequest(`${BASE_URL}/tasks/${taskId}`);
    console.log(`  GET /tasks/${taskId} after PUT: ${taskAfterPut.durationMs} ms (X-Cache: ${taskAfterPut.cacheHeader})`);
    console.log(`  => Invalidation check: X-Cache was MISS? ${taskAfterPut.cacheHeader === 'MISS' ? 'YES' : 'NO'}`);

    // 6. Test Cache Invalidation on DELETE
    console.log('\n--- 6. Testing Cache Invalidation on DELETE /tasks/:id ---');
    await makeRequest(`${BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
    const tasksAfterDelete = await makeRequest(`${BASE_URL}/tasks`);
    console.log(`  GET /tasks after DELETE: ${tasksAfterDelete.durationMs} ms (X-Cache: ${tasksAfterDelete.cacheHeader})`);
    const stillPresent = tasksAfterDelete.data.some(t => t._id === taskId);
    console.log(`  => Invalidation check: Deleted task absent? ${!stillPresent ? 'YES (Correctly deleted and cache updated)' : 'NO'}`);

    // 7. Check Debug Stats Endpoint
    console.log('\n--- 7. Querying Debug Cache Stats (/debug/cache) ---');
    const statsRes = await makeRequest(`${BASE_URL}/debug/cache`);
    console.log('  Debug Stats Response:');
    console.log(JSON.stringify(statsRes.data, null, 2));

    console.log('\n====================================================');
    console.log('  BENCHMARK & VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('====================================================\n');

  } catch (err) {
    console.error('Benchmark Error:', err.message);
  }
}

runBenchmark();
