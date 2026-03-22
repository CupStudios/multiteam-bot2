const economyService = require('../../services/economyService');
const shopService = require('../../services/shopService');

module.exports = {
  name: 'inventario',
  async execute({ message, args }) {
    const senderId = message.author || message.from;
    const page = Math.max(1, Number.parseInt(args[0], 10) || 1);

    const inventory = await economyService.listInventory(senderId);
    const entries = Object.entries(inventory)
      .filter(([, qty]) => qty > 0)
      .map(([itemKey, qty]) => {
        const item = shopService.SHOP_ITEMS.find((shopItem) => shopItem.key === itemKey);
        return {
          key: itemKey,
          qty,
          name: item?.name || itemKey,
          emoji: item?.emoji || '📦'
        };
      });

    if (entries.length === 0) {
      await message.reply('🎒 Tu inventario está vacío. Compra algo con *!shop*');
      return;
    }

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const visible = entries.slice(start, start + pageSize);

    const lines = [
      `🎒 *INVENTARIO* (Página ${safePage}/${totalPages})`,
      ''
    ];

    for (const item of visible) {
      lines.push(`${item.emoji} *${item.name}* — x${item.qty}`);
    }

    lines.push('');
    lines.push('Usa: *!inventario [pagina]* para navegar.');

    await message.reply(lines.join('\n'));
  }
};
