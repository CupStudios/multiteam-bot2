const { getWalletBank, ensureUser } = require('../../services/economyService');

module.exports = {
  name: 'bal',
  async execute({ message }) {
    const mentions = await message.getMentions();
    const target = mentions.length > 0 ? mentions[0] : null;
    const targetId = target?.id?._serialized || message.author || message.from;

    await ensureUser(targetId);
    const { wallet, bank, total } = await getWalletBank(targetId);
    const targetName = target ? (target.pushname || target.id.user) : 'Tu';

    await message.reply(`🏦 *Estado Financiero de ${targetName}*\n\n· 💴 **Billetera:** ${wallet} Yenes\n· 🏛️ **Banco:** ${bank} Yenes\n· 💰 **Total:** ${total} Yenes`);
  }
};
