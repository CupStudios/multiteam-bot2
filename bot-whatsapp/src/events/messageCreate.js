const config = require('../config/config');
const fichaFlowService = require('../services/fichaFlowService');
const logger = require('../utils/logger');

function registerMessageCreateEvent(client, commandHandler) {
  client.on('message_create', async (message) => {
    try {
      const body = typeof message.body === 'string' ? message.body : '';

      if (body.startsWith(config.prefix)) {
        // NOTE: Commands are allowed from the bot author account (`fromMe`) for self-hosted setups.
        await commandHandler.handleMessage(client, message);
        return;
      }

      // Keep interactive ficha flow for participant messages; own bot replies are ignored to avoid self-looping.
      if (!message.fromMe) {
        await fichaFlowService.handleSessionMessage(client, message);
      }
    } catch (error) {
      logger.error('Failed handling message_create event', error);
    }
  });
}

module.exports = { registerMessageCreateEvent };
