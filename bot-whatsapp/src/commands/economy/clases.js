const economyService = require('../../services/economyService');
const { SHOP_ITEMS } = require('../../services/shopCatalog');

module.exports = {
  name: 'clases',
  async execute({ message }) {
    const senderId = message.author || message.from;
    const status = await economyService.getStatus(senderId);

    const bestToScale = [...SHOP_ITEMS]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map((item) => `• ${item.emoji} ${item.name} (${item.price} Yenes)`)
      .join('\n');

    const text = [
      '🏷️ *SISTEMA DE CLASES SOCIALES*',
      '',
      'Tu clase depende de tu patrimonio, pero el inventario pesa más.',
      'Fórmula interna aproximada: *(valor de ítems × 3) + (billetera + banco)*.',
      '',
      `Tu clase actual: *${status.socialClass}*`,
      `Patrimonio inventario: *${status.inventoryValue}* Yenes`,
      `Dinero líquido+Banco: *${status.total}* Yenes`,
      '',
      '📈 *Cómo subir de clase más rápido*',
      '1) Compra y acumula ítems caros (suben mucho la puntuación).',
      '2) Mantén dinero en banco y billetera de forma estable.',
      '3) Evita perder ítems en robos o usos innecesarios.',
      '',
      '🛒 *Ítems recomendados para subir clase*',
      bestToScale,
      '',
      '💡 Tip: para revisar detalles usa *!shop info [item]* y para ver progreso de prestige usa *!prestige requisitos*.'
    ];

    await message.reply(text.join('\n'));
  }
};
