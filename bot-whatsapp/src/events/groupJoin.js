const config = require('../config/config');
const fichaFlowService = require('../services/fichaFlowService');
const { normalizeId } = require('../utils/ids');
const logger = require('../utils/logger');

function registerGroupJoinEvent(client) {
  client.on('group_join', async (notification) => {
    logger.info('A participant joined a group', {
      chatId: notification.chatId,
      recipientIds: notification.recipientIds
    });

    if (!config.fichaGroupId) return;
    if (notification.chatId !== config.fichaGroupId || !notification.recipientIds?.length) return;

    const userId = normalizeId(notification.recipientIds[0]);
    if (!userId) return;

    fichaFlowService.startSession(userId);

    try {
      const chat = await client.getChatById(config.fichaGroupId);
      await chat.sendMessage(
        '¡Bienvenido/a al grupo! 🎭 Para empezar, por favor llena tu ficha respondiendo a este mensaje.\n\n¿Cuál es el nombre de tu **Personaje**?',
        { mentions: [userId] }
      );
    } catch (error) {
      logger.warn('Failed to send onboarding ficha message', error);
    }
  });
}

module.exports = { registerGroupJoinEvent };
