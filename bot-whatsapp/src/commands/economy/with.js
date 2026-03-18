const economyService = require('../../services/economyService');

module.exports = {
  // NOTE: keeping command name `with` for backward compatibility with the uploaded command bundle.
  name: 'with',
  async execute({ message, args }) {
    const senderId = message.author || message.from;
    const amountText = args[0];

    try {
      const amount = await economyService.transferToWallet(senderId, amountText);
      await message.reply(`💰 Has retirado **${amount} Yenes** del banco.`);
    } catch (error) {
      if (error.message === 'INVALID_WITHDRAW') {
        await message.reply('❌ Cantidad inválida o no tienes ese dinero en el banco.');
        return;
      }
      throw error;
    }
  }
};
