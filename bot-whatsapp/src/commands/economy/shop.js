const economyService = require('../../services/economyService');

const cafePrice = 1200;
const cafeDurationMinutes = 30;

function getShopText() {
  return `🛒 *TIENDA DE OBJETOS*\n\n` +
    `1) ☕ *Café*\n` +
    `• Precio: **${cafePrice} Yenes**\n` +
    `• Efecto: reduce a la mitad los cooldowns por ${cafeDurationMinutes} minutos.\n\n` +
    `Uso: *!shop buy cafe*`;
}

module.exports = {
  name: 'shop',
  async execute({ message, args }) {
    const senderId = message.author || message.from;
    const action = (args[0] || '').toLowerCase();
    const item = (args[1] || '').toLowerCase();

    if (!action) {
      await message.reply(getShopText());
      return;
    }

    if (action !== 'buy' || item !== 'cafe') {
      await message.reply('⚠️ Comando inválido. Usa *!shop* para ver la tienda o *!shop buy cafe* para comprar.');
      return;
    }

    try {
      const tx = await economyService.buyCafe(senderId);
      await message.reply(`☕ Compraste *Café* por **${tx.price} Yenes**. Tu buff de cooldown está activo por 30 minutos.`);
    } catch (error) {
      if (error.message === 'SHOP_NO_FUNDS') {
        await message.reply('❌ No tienes Yenes suficientes para comprar Café.');
        return;
      }
      throw error;
    }
  }
};
