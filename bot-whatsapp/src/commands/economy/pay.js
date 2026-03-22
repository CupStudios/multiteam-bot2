const economyService = require('../../services/economyService');
const { normalizeId } = require('../../utils/ids');

module.exports = {
  name: 'pay',
  async execute({ client, message, args }) {
    const mentionedIds = Array.isArray(message.mentionedIds) ? message.mentionedIds : [];
    const amountText = args.find((value) => /^\d+$/.test(value));

    if (mentionedIds.length === 0 || !amountText) {
      await message.reply('⚠️ Uso: *!pay @usuario [cantidad]*');
      return;
    }

    const senderId = message.author || message.from;
    const receiverId = normalizeId(mentionedIds[0]);
    let receiverUser = receiverId.split('@')[0];
    try {
      const contact = await client.getContactById(receiverId);
      receiverUser = contact.id.user || receiverUser;
    } catch {
      // fallback
    }

    try {
      const tx = await economyService.pay(senderId, receiverId, amountText);
      await message.reply(`💸 Has enviado **${tx.amount} Yenes** a @${receiverUser}.`, undefined, {
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
