const economyService = require('../../services/economyService');

module.exports = {
  name: 'prestige',
  async execute({ message, args }) {
    const senderId = message.author || message.from;
    const action = (args[0] || '').toLowerCase();

    try {
      if (action === 'confirmar') {
        const tx = await economyService.confirmPrestige(senderId);
        await message.reply(`🌟 ¡Prestigio completado! Ahora tienes *${tx.prestige}* prestigio(s). Empezaste desde cero con bonificaciones permanentes.`);
        return;
      }

      await economyService.requestPrestige(senderId);
      await message.reply('⚠️ Vas a reiniciar tu dinero, banco, inventario y clase social.\nSi estás seguro, escribe: *!prestige confirmar*');
    } catch (error) {
      if (error.message === 'PRESTIGE_REQUIREMENTS') {
        await message.reply('❌ No cumples los requisitos de prestigio todavía. Mejora tu clase social y patrimonio primero.');
        return;
      }
      if (error.message === 'PRESTIGE_NOT_PENDING') {
        await message.reply('ℹ️ No hay un prestigio pendiente. Escribe *!prestige* primero.');
        return;
      }
      throw error;
    }
  }
};
