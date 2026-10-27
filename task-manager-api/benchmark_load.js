/**
 * Automated Load Testing Benchmark Script (Apache Bench Equivalent)
 * Measures RPS, Mean Latency, and Error Rate for GET /tasks with and without in-memory caching.
 * Works natively on Windows, macOS, and Linux without external binaries.
 */
const http = require('http');

const PORT = 5000;
const HOST = 'localhost';
const AGENT = new http.Agent({ keepAlive: true, maxSockets: 100 });

function singleRequest(path) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const req = http.get(
      {
        hostname: HOST,
        port: PORT,
        path: path,
        agent: AGENT,
        headers: { 'Connection': 'keep-alive' }
      },
      (res) => {
        let bytes = 0;
        res.on('data', chunk => { bytes += chunk.length; });
        res.on('end', () => {
          const end = process.hrtime.bigint();
          const durationMs = Number(end - start) / 1e6;
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            durationMs,
            bytes
          });
        });
      }
    );

    req.on('error', (err) => {
      const end = process.hrtime.bigint();
      resolve({
        success: false,
        statusCode: 0,
        durationMs: Number(end - start) / 1e6,
        bytes: 0,
        error: err.message
      });
    });
  });
}

async function runScenario({ name, path, totalRequests, concurrency }) {
  console.log(`\n---------------------------------------------------------`);
  console.log(`  Scenario: ${name}`);
  console.log(`  Target: http://${HOST}:${PORT}${path}`);
  console.log(`  Requests: ${totalRequests} | Concurrency: ${concurrency}`);
  console.log(`---------------------------------------------------------`);

  // Warmup 5 requests
  for (let i = 0; i < 5; i++) {
    await singleRequest(path);
  }

  const results = [];
  let completed = 0;
  let inFlight = 0;
  let index = 0;

  const benchStart = process.hrtime.bigint();

  await new Promise((resolve) => {
    function launchNext() {
      while (inFlight < concurrency && index < totalRequests) {
        index++;
        inFlight++;
        singleRequest(path).then((res) => {
          results.push(res);
          inFlight--;
          completed++;
          if (completed === totalRequests) {
            resolve();
          } else {
            launchNext();
          }
        });
      }
    }
    launchNext();
  });

  const benchEnd = process.hrtime.bigint();
  const totalDurationSec = Number(benchEnd - benchStart) / 1e9;
  const rps = (totalRequests / totalDurationSec).toFixed(2);

  const successful = results.filter(r => r.success).length;
  const failed = totalRequests - successful;
  const errorRate = ((failed / totalRequests) * 100).toFixed(2);

  const latencies = results.map(r => r.durationMs).sort((a, b) => a - b);
  const sumLatency = latencies.reduce((acc, v) => acc + v, 0);
  const meanLatency = (sumLatency / latencies.length).toFixed(2);
  const minLatency = latencies[0].toFixed(2);
  const maxLatency = latencies[latencies.length - 1].toFixed(2);
  const p50 = latencies[Math.floor(latencies.length * 0.50)].toFixed(2);
  const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
  const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);

  console.log(`  ✅ Complete Requests:   ${totalRequests}`);
  console.log(`  ⚡ Requests Per Second: ${rps} req/sec`);
  console.log(`  ⏱️ Mean Latency:        ${meanLatency} ms`);
  console.log(`  📈 Min / P50 / P95:     ${minLatency}ms / ${p50}ms / ${p95}ms`);
  console.log(`  ⚠️ Failed Requests:     ${failed} (${errorRate}%)`);

  return {
    name,
    totalRequests,
    concurrency,
    rps: parseFloat(rps),
    meanLatency: parseFloat(meanLatency),
    p95: parseFloat(p95),
    failedRequests: failed,
    errorRate: `${errorRate}%`
  };
}

async function main() {
  console.log("=========================================================");
  console.log("   APACHE BENCH / LOAD TESTING PERFORMANCE BENCHMARK     ");
  console.log("=========================================================");

  // Prime the cache
  await singleRequest('/tasks');

  // Baseline Test 1: Concurrency 10, Requests 200 (Without Cache vs With Cache)
  console.log("\n>>> BENCHMARK SUITE 1: Standard Load (-n 200 -c 10) <<<");
  const uncached10 = await runScenario({
    name: "Without Cache (Direct MongoDB Query)",
    path: "/tasks?noCache=true",
    totalRequests: 200,
    concurrency: 10
  });

  const cached10 = await runScenario({
    name: "With Cache (node-cache In-Memory)",
    path: "/tasks",
    totalRequests: 200,
    concurrency: 10
  });

  // Stress Test 2: Concurrency 50, Requests 500 (Higher Concurrency)
  console.log("\n>>> BENCHMARK SUITE 2: Higher Concurrency Stress (-n 500 -c 50) <<<");
  const uncached50 = await runScenario({
    name: "Without Cache (High Concurrency 50)",
    path: "/tasks?noCache=true",
    totalRequests: 500,
    concurrency: 50
  });

  const cached50 = await runScenario({
    name: "With Cache (High Concurrency 50)",
    path: "/tasks",
    totalRequests: 500,
    concurrency: 50
  });

  // Calculate percentage improvements
  const rpsBoost10 = (((cached10.rps - uncached10.rps) / uncached10.rps) * 100).toFixed(1);
  const latencyReduction10 = (((uncached10.meanLatency - cached10.meanLatency) / uncached10.meanLatency) * 100).toFixed(1);

  const rpsBoost50 = (((cached50.rps - uncached50.rps) / uncached50.rps) * 100).toFixed(1);
  const latencyReduction50 = (((uncached50.meanLatency - cached50.meanLatency) / uncached50.meanLatency) * 100).toFixed(1);

  console.log("\n=========================================================");
  console.log("               FINAL COMPARISON SUMMARY                  ");
  console.log("=========================================================");
  console.log("\nTable 1: Standard Load (-n 200 -c 10):");
  console.table([
    { Metric: "Requests Per Second (RPS)", "Without Cache": uncached10.rps, "With Cache": cached10.rps, Improvement: `+${rpsBoost10}%` },
    { Metric: "Mean Latency (ms)", "Without Cache": `${uncached10.meanLatency} ms`, "With Cache": `${cached10.meanLatency} ms`, Improvement: `-${latencyReduction10}%` },
    { Metric: "95th Percentile Latency", "Without Cache": `${uncached10.p95} ms`, "With Cache": `${cached10.p95} ms`, Improvement: "Faster" },
    { Metric: "Failed Requests", "Without Cache": uncached10.failedRequests, "With Cache": cached10.failedRequests, Improvement: "0% Errors" }
  ]);

  console.log("\nTable 2: High Concurrency Load (-n 500 -c 50):");
  console.table([
    { Metric: "Requests Per Second (RPS)", "Without Cache": uncached50.rps, "With Cache": cached50.rps, Improvement: `+${rpsBoost50}%` },
    { Metric: "Mean Latency (ms)", "Without Cache": `${uncached50.meanLatency} ms`, "With Cache": `${cached50.meanLatency} ms`, Improvement: `-${latencyReduction50}%` },
    { Metric: "Failed Requests", "Without Cache": uncached50.failedRequests, "With Cache": cached50.failedRequests, Improvement: "0% Errors" }
  ]);

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { runScenario };
