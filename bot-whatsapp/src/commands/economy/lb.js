const economyService = require('../../services/economyService');

module.exports = {
  name: 'lb',
  async execute({ client, message }) {
    const ranking = await economyService.getLeaderboard(10);

    if (ranking.length === 0) {
      await message.reply('💴 El sistema de economía está vacío todavía.');
      return;
    }

    let text = '🏆 *TOP 10 - LOS MÁS RICOS* 🏆\n\n';

    for (let i = 0; i < ranking.length; i += 1) {
      const item = ranking[i];

      try {
        const contact = await client.getContactById(item.id);
        const name = contact.pushname || item.id.split('@')[0];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
        text += `${medal} *${name}*: 💴 ${item.total} Yenes\n`;
      } catch {
        text += `• *Usuario* (${item.id.split('@')[0]}): 💴 ${item.total} Yenes\n`;
      }
    }

    await message.reply(text);
  }
};
