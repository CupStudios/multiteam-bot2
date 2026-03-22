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

      const req = await economyService.getPrestigeRequirements(senderId);

      if (action === 'requisitos') {
        await message.reply(`📜 *Requisitos de Prestige*\n• Patrimonio mínimo: *${req.minAssets}* Yenes (dinero + valor de inventario)\n• Clase mínima: *${req.minClass}*\n\n📊 *Tu progreso*\n• Patrimonio actual: *${req.currentAssets}*\n• Clase actual: *${req.currentClass}*\n• Patrimonio: *${req.meetsAssets ? '✅' : '❌'}*\n• Clase: *${req.meetsClass ? '✅' : '❌'}*`);
        return;
      }

      await economyService.requestPrestige(senderId);
      await message.reply(`📜 *Requisitos de Prestige*\n• Patrimonio mínimo: *${req.minAssets}* Yenes\n• Clase mínima: *${req.minClass}*\n\n⚠️ Vas a reiniciar tu dinero, banco, inventario y clase social.\nSi estás seguro, escribe: *!prestige confirmar*`);
    } catch (error) {
      if (error.message === 'PRESTIGE_REQUIREMENTS') {
        const req = await economyService.getPrestigeRequirements(senderId);
        await message.reply(`❌ No cumples los requisitos de prestigio.\n\n📜 Requisitos: *${req.minAssets}* Yenes y clase *${req.minClass}*.\n📊 Actualmente: *${req.currentAssets}* Yenes y clase *${req.currentClass}*.`);
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
