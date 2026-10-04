const NodeCache = require('node-cache');

// Initialize cache instance with standard TTL of 60 seconds (stdTTL: 60)
// and checkperiod of 120 seconds for automatic cleanup of expired entries
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

module.exports = cache;
