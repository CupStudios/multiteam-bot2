const economyService = require('../../services/economyService');

module.exports = {
  name: 'work',
  description: 'Trabaja para ganar Yenes (3 min de cooldown).',
  async execute({ message }) {
    const senderId = message.author || message.from;

    try {
      const tx = await economyService.work(senderId);
      if (tx.multiplier > 1) {
        await message.reply(`⚒️ Trabajaste duro y ganaste **${tx.salary} Yenes** (x${tx.multiplier} por Café Expreso Doble).`);
        return;
      }
      await message.reply(`⚒️ Trabajaste duro y ganaste **${tx.salary} Yenes**.`);
    } catch (error) {
      if (error.message.startsWith('WORK_COOLDOWN:')) {
        const minutes = error.message.split(':')[1];
        await message.reply(`⌛ Estás cansado. Vuelve a trabajar en ${minutes} minutos.`);
        return;
      }

      throw error;
    }
  }
};
