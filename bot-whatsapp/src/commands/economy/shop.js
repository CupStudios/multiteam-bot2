const shopService = require('../../services/shopService');

function getShopText(pageData) {
  const lines = [
    `🛒 *TIENDA* — ${pageData.categoryLabel}`,
    `Página ${pageData.page}/${pageData.totalPages}`,
    ''
  ];

  for (let i = 0; i < pageData.items.length; i += 1) {
    const item = pageData.items[i];
    lines.push(`${i + 1}. ${item.emoji} *${item.name}* — ${item.price} Yenes`);
    if (item.usable) {
      lines.push(`   Uso: *!usar ${item.aliases[0]}*${item.requiresTarget ? ' *@usuario*' : ''}`);
    } else {
      lines.push(`   Pasivo: ${item.passiveDescription}`);
    }
  }

  lines.push('');
  lines.push('Categorías: *baratos*, *medios*, *caros*');
  lines.push('Ver página: *!shop [categoria] [pagina]*');
  lines.push('Comprar: *!shop buy [item]*');
  return lines.join('\n');
}

module.exports = {
  name: 'shop',
  async execute({ message, args }) {
    const senderId = message.author || message.from;
    const action = (args[0] || '').toLowerCase();

    if (!action || ['baratos', 'medios', 'caros'].includes(action)) {
      const category = action || 'baratos';
      const page = Number.parseInt(args[1], 10) || 1;
      const pageData = shopService.getShopPage({ category, page, pageSize: 5 });
      await message.reply(getShopText(pageData));
      return;
    }

    if (action !== 'buy') {
      if (action === 'info') {
        const itemQuery = args.slice(1).join(' ');
        if (!itemQuery) {
          await message.reply('⚠️ Usa *!shop info [item]* para ver detalles.');
          return;
        }

        try {
          const item = shopService.getItemInfo(itemQuery);
          await message.reply(`${item.emoji} *${item.name}*\n💴 Precio: *${item.price} Yenes*\n🏷️ Categoría: *${item.category}*\n🧩 Tipo: *${item.usable ? 'Manual' : 'Pasivo'}*\n📌 ${item.description}`);
          return;
        } catch (error) {
          if (error.message === 'SHOP_ITEM_NOT_FOUND') {
            await message.reply('❌ No encontré ese ítem en la tienda.');
            return;
          }
          throw error;
        }
      }
      await message.reply('⚠️ Comando inválido. Usa *!shop [categoria] [pagina]*, *!shop buy [item]* o *!shop info [item]*.');
      return;
    }

    const item = args.slice(1).join(' ');
    if (!item) {
      await message.reply('⚠️ Debes indicar qué ítem comprar. Ejemplo: *!shop buy platano*');
      return;
    }

    try {
      const tx = await shopService.buyItem(senderId, item);
      await message.reply(`✅ Compraste *${tx.item.name}* por **${tx.price} Yenes**.`);
    } catch (error) {
      if (error.message === 'SHOP_NO_FUNDS') {
        await message.reply('❌ No tienes Yenes suficientes para esa compra.');
        return;
      }
      if (error.message === 'SHOP_ITEM_NOT_FOUND') {
        await message.reply('❌ No encontré ese ítem en la tienda.');
        return;
      }
      throw error;
    }
  }
};
