const fichaFlowService = require('../../services/fichaFlowService');

module.exports = {
  name: 'ficha',
  async execute({ message }) {
    const senderId = fichaFlowService.getSenderId(message);
    if (!senderId) return;

    fichaFlowService.startSession(senderId);
    await message.reply('¡Iniciando tu ficha! 📝 Por favor, dime el nombre de tu **Personaje**:');
  }
};
