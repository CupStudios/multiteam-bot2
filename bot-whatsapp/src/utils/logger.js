// Lightweight logger utility with timestamped output.
const formatNow = () => new Date().toISOString();

const stringify = (value) => {
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Unserializable Object]';
    }
  }
  return String(value);
};

const log = (level, message, meta) => {
  const line = `[${formatNow()}] [${level.toUpperCase()}] ${message}`;
  if (typeof meta === 'undefined') {
    console.log(line);
    return;
  }
  console.log(`${line} ${stringify(meta)}`);
};

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  debug: (message, meta) => log('debug', message, meta)
};
