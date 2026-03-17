const fs = require('fs');
const { createClient } = require('./client');
const { CommandHandler } = require('./commandHandler');
const { registerMessageCreateEvent } = require('../events/messageCreate');
const { registerGroupJoinEvent } = require('../events/groupJoin');
const config = require('../config/config');
const logger = require('../utils/logger');

// Bot orchestration layer: wires client, commands, and events.
async function startBot() {
  const client = createClient();
  const commandHandler = new CommandHandler();

  let qrEmitted = false;
  let readyEmitted = false;

  commandHandler.loadCommands();

  registerMessageCreateEvent(client, commandHandler);
  registerGroupJoinEvent(client);

  client.on('qr', async (qr) => {
    qrEmitted = true;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qr)}`;

    logger.info('QR code received. Open this URL in your browser to scan:');
    logger.info(qrUrl);

    // Save raw QR payload so headless/PM2 users can recover it from disk.
    try {
      await fs.promises.writeFile(config.qrRawPath, `${qr}\n`, 'utf8');
      logger.info(`Raw QR payload saved to: ${config.qrRawPath}`);
      logger.info(`If URL rendering fails, open the file and paste the payload into an online QR generator.`);
    } catch (error) {
      logger.warn('Could not persist QR payload to disk', error);
    }
  });

  client.on('ready', async () => {
    readyEmitted = true;
    logger.info('WhatsApp bot is ready.');

    // Optional cleanup after successful auth.
    try {
      await fs.promises.rm(config.qrRawPath, { force: true });
    } catch {
      // no-op
    }
  });

  client.on('authenticated', () => {
    logger.info('Client authenticated successfully.');
  });

  client.on('auth_failure', (message) => {
    logger.error('Authentication failed', message);
  });

  client.on('disconnected', (reason) => {
    logger.warn('Client disconnected', reason);
  });

  await client.initialize();

  // Diagnostic guidance for the common "no QR shown" scenario in LocalAuth setups.
  setTimeout(async () => {
    if (qrEmitted || readyEmitted) return;

    logger.warn('No QR event was emitted yet. This usually means one of these cases:');
    logger.warn('1) A LocalAuth session already exists and the client is restoring it.');
    logger.warn(`2) Chromium startup is blocked (missing libs/permissions).`);
    logger.warn(`3) Session files are stale/corrupted and need reset.`);

    try {
      const authExists = fs.existsSync(config.authPath);
      logger.warn(`LocalAuth path (${config.authPath}) exists: ${authExists}`);
      logger.warn('If you need a fresh QR, stop the bot and remove .wwebjs_auth, then start again.');
    } catch (error) {
      logger.warn('Could not inspect LocalAuth path', error);
    }
  }, 30000);
}

module.exports = { startBot };
