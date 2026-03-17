const { startBot } = require('./src/core/bot');
const logger = require('./src/utils/logger');

// Project entrypoint: initializes and starts the WhatsApp bot lifecycle.
(async () => {
  try {
    await startBot();
  } catch (error) {
    logger.error('Fatal startup error', error);
    process.exitCode = 1;
  }
})();
