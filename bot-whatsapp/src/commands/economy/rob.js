const economyService = require('../../services/economyService');
const { normalizeId } = require('../../utils/ids');

module.exports = {
  name: 'rob',
  async execute({ client, message }) {
    const mentionedIds = Array.isArray(message.mentionedIds) ? message.mentionedIds : [];
    if (mentionedIds.length === 0) {
      await message.reply('❌ Menciona a quién quieres robar.');
      return;
    }

    const senderId = message.author || message.from;
    const victimId = normalizeId(mentionedIds[0]);
    let victimUser = victimId.split('@')[0];
    try {
      const contact = await client.getContactById(victimId);
      victimUser = contact.id.user || victimUser;
    } catch {
      // fallback to parsed id
    }

    try {
      const tx = await economyService.rob(senderId, victimId);
      if (tx.blockedByLock) {
        await message.reply(`🔒 @${victimUser} tenía un Candado de Bolsillo. ¡Robo bloqueado!`, undefined, {
          mentions: [victimId]
        });
      } else if (tx.success) {
        await message.reply(`🥷 ¡Éxito! Le robaste **${tx.stolen} Yenes** a @${victimUser}`, undefined, {
          mentions: [victimId]
        });
      } else {
        if (tx.usedBriefcase) {
          await message.reply('💼 Usaste tu Maletín de Soborno: sin multa y sin cooldown de robo.');
          return;
        }
        if (tx.evadedSanction) {
          await message.reply('🛡️ Tu clase social te protegió: evitaste multa y cooldown esta vez.');
          return;
        }
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
