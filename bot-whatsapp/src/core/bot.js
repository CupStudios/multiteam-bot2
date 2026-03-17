const { createClient } = require('./client');
const { CommandHandler } = require('./commandHandler');
const { registerMessageCreateEvent } = require('../events/messageCreate');
const { registerGroupJoinEvent } = require('../events/groupJoin');
const logger = require('../utils/logger');

// Bot orchestration layer: wires client, commands, and events.
async function startBot() {
  const client = createClient();
  const commandHandler = new CommandHandler();

  commandHandler.loadCommands();

  registerMessageCreateEvent(client, commandHandler);
  registerGroupJoinEvent(client);

  client.on('qr', () => {
    logger.info('QR code received. Scan it in WhatsApp to authenticate.');
  });

  client.on('ready', () => {
    logger.info('WhatsApp bot is ready.');
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
