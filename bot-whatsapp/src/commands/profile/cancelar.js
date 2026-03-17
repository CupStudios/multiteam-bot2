const fichaFlowService = require('../../services/fichaFlowService');

module.exports = {
  name: 'cancelar',
  async execute({ message }) {
    const senderId = fichaFlowService.getSenderId(message);
    if (!senderId) return;

    if (fichaFlowService.cancelSession(senderId)) {
      await message.reply('🚫 Has cancelado el proceso de creación de la ficha. Puedes empezar de nuevo enviando *!ficha* cuando estés listo/a.');
      return;
    }

    await message.reply('ℹ️ No tienes una ficha en proceso ahora mismo.');
  }
};
