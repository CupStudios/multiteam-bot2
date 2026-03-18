const economyService = require('../../services/economyService');

module.exports = {
  name: 'dep',
  description: 'Deposita dinero en el banco.',
  async execute({ message, args }) {
    const senderId = message.author || message.from;
    const amountText = args[0];

    try {
      const amount = await economyService.transferToBank(senderId, amountText);
      await message.reply(`🏛️ Has depositado **${amount} Yenes** en el banco.`);
    } catch (error) {
      if (error.message === 'INVALID_DEPOSIT') {
        await message.reply('❌ Cantidad inválida o no tienes suficientes Yenes en tu billetera.');
        return;
      }
      throw error;
    }
  }
};
