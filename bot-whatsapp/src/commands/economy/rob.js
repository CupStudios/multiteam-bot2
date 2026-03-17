const economyService = require('../../services/economyService');

module.exports = {
  name: 'rob',
  async execute({ message }) {
    const mentions = await message.getMentions();
    if (mentions.length === 0) {
      await message.reply('❌ Menciona a quién quieres robar.');
      return;
    }

    const senderId = message.author || message.from;
    const victimId = mentions[0].id._serialized;

    try {
      const tx = await economyService.rob(senderId, victimId);
      if (tx.success) {
        await message.reply(`🥷 ¡Éxito! Le robaste **${tx.stolen} Yenes** a @${mentions[0].id.user}`, undefined, {
          mentions: [victimId]
        });
      } else {
        await message.reply(`🚓 ¡Te atraparon! Pagaste **${tx.fine} Yenes** de multa.`);
      }
    } catch (error) {
      if (error.message === 'ROB_SELF') {
        await message.reply('❌ No puedes robarte a ti mismo.');
        return;
      }
      if (error.message === 'ROB_COOLDOWN') {
        await message.reply('🚨 La policía te busca, espera 30 min para volver a robar.');
        return;
      }
      if (error.message === 'ROB_POOR_TARGET') {
        await message.reply('Esa persona es demasiado pobre para robarle.');
        return;
      }

      throw error;
    }
  }
};
