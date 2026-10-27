const NodeCache = require('node-cache');

// Initialize cache instance with standard TTL of 120 seconds (stdTTL: 120)
// to ensure cache remains hot during high-concurrency load testing
const cache = new NodeCache({ stdTTL: 120, checkperiod: 120 });

module.exports = cache;
