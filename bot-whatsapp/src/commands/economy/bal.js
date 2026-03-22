const { getWalletBank, ensureUser } = require('../../services/economyService');
const { normalizeId } = require('../../utils/ids');

module.exports = {
  name: 'bal',
  async execute({ client, message }) {
    const mentionedIds = Array.isArray(message.mentionedIds) ? message.mentionedIds : [];
    const targetId = normalizeId(mentionedIds[0] || message.author || message.from);

    await ensureUser(targetId);
    const { wallet, bank, total } = await getWalletBank(targetId);
    let targetName = 'Tu';

    if (mentionedIds.length > 0) {
      try {
        const contact = await client.getContactById(targetId);
        targetName = contact.pushname || contact.id.user || targetId.split('@')[0];
      } catch {
        targetName = targetId.split('@')[0];
      }
    }

    await message.reply(`🏦 *Estado Financiero de ${targetName}*\n\n· 💴 **Billetera:** ${wallet} Yenes\n· 🏛️ **Banco:** ${bank} Yenes\n· 💰 **Total:** ${total} Yenes`);
  }
};
