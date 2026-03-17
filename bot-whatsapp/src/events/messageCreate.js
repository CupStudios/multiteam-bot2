const config = require('../config/config');

// Message event binding: filters messages and forwards commands.
function registerMessageCreateEvent(client, commandHandler) {
  client.on('message_create', async (message) => {
    if (message.fromMe) return;
    if (typeof message.body !== 'string' || !message.body.startsWith(config.prefix)) return;

    await commandHandler.handleMessage(client, message);
  });
}

module.exports = { registerMessageCreateEvent };
