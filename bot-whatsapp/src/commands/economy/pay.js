const economyService = require('../../services/economyService');

module.exports = {
  name: 'pay',
  async execute({ message, args }) {
    const mentions = await message.getMentions();
    const amountText = args.find((value) => /^\d+$/.test(value));

    if (mentions.length === 0 || !amountText) {
      await message.reply('⚠️ Uso: *!pay @usuario [cantidad]*');
      return;
    }

    const senderId = message.author || message.from;
    const receiverId = mentions[0].id._serialized;

    try {
      const tx = await economyService.pay(senderId, receiverId, amountText);
      await message.reply(`💸 Has enviado **${tx.amount} Yenes** a @${mentions[0].id.user}.`, undefined, {
        mentions: [receiverId]
      });
    } catch (error) {
      if (error.message === 'INVALID_PAY_AMOUNT') {
        await message.reply('❌ Cantidad inválida. Debe ser un número mayor a 0.');
        return;
      }
      if (error.message === 'PAY_SELF') {
        await message.reply('❌ No puedes enviarte dinero a ti mismo.');
        return;
      }
      if (error.message === 'PAY_NO_FUNDS') {
        await message.reply('❌ No tienes suficiente dinero en la billetera.');
        return;
      }
      throw error;
    }
  }
};
