const economyService = require('../../services/economyService');

module.exports = {
  name: 'roll',
  async execute({ message }) {
    const senderId = message.author || message.from;

    try {
      const tx = await economyService.roll(senderId);
      if (tx.success) {
        if (tx.forcedSuccess) {
          await message.reply(`🎲 Tu Dado Trucado se activó: tirada garantizada. Ganaste **${tx.reward} Yenes**.`);
          return;
        }
        await message.reply(`🎲 ¡Tiraste los dados y ganaste! Recibes **${tx.reward} Yenes**.`);
      } else {
        await message.reply(`🎲 Los dados no te favorecieron. ¡Perdiste **${tx.fine} Yenes**! Suerte para la próxima.`);
      }
    } catch (error) {
      if (error.message.startsWith('ROLL_COOLDOWN:')) {
        const minutes = error.message.split(':')[1];
        await message.reply(`⌛ Estás en cooldown. Vuelve a tirar el dado en ${minutes} minutos.`);
        return;
      }
      throw error;
    }
  }
};
