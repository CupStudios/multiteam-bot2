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

  commandHandler.loadCommands();

  registerMessageCreateEvent(client, commandHandler);
  registerGroupJoinEvent(client);

  client.on('qr', async (qr) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qr)}`;

    logger.info('QR code received. Open this URL in your browser to scan:');
    logger.info(qrUrl);

    // Save raw QR payload so headless/PM2 users can recover it from disk.
    try {
      await fs.promises.writeFile(config.qrRawPath, `${qr}\n`, 'utf8');
      logger.info(`Raw QR payload saved to: ${config.qrRawPath}`);
    } catch (error) {
      logger.warn('Could not persist QR payload to disk', error);
    }
  });

  client.on('ready', async () => {
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
}

module.exports = { startBot };
