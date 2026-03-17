const logger = require('../utils/logger');

// Group join event scaffold. Add onboarding logic here later if needed.
function registerGroupJoinEvent(client) {
  client.on('group_join', (notification) => {
    logger.info('A participant joined a group', {
      chatId: notification.chatId,
      recipientIds: notification.recipientIds
    });
  });
}

module.exports = { registerGroupJoinEvent };
