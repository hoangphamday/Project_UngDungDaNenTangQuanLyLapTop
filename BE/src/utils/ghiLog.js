const anToan = (value) => value instanceof Error ? `${value.name}: ${value.message}` : String(value);
module.exports = {
  info: (message) => console.info(`[INFO] ${anToan(message)}`),
  warn: (message) => console.warn(`[WARN] ${anToan(message)}`),
  error: (message) => console.error(`[ERROR] ${anToan(message)}`),
};
