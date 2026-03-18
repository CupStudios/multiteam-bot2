const economyService = require('../../services/economyService');

module.exports = {
  name: 'daily',
  async execute({ message }) {
    const senderId = message.author || message.from;

    try {
      const tx = await economyService.claimDaily(senderId);
      await message.reply(`🎁 ¡Recompensa diaria! Has recibido **${tx.reward} Yenes**.\n🔥 Racha actual: ${tx.streak} días.`);
    } catch (error) {
      if (error.message.startsWith('DAILY_COOLDOWN:')) {
        const hours = error.message.split(':')[1];
        await message.reply(`🌙 Ya reclamaste tu recompensa. Vuelve en ${hours} horas.`);
        return;
      }

      throw error;
    }
  }
};
