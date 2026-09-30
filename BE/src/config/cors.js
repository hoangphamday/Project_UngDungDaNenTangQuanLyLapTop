const env = require('./env');

module.exports = Object.freeze({
  origin: env.corsOrigins.includes('*') ? true : env.corsOrigins,
  credentials: !env.corsOrigins.includes('*'),
});
