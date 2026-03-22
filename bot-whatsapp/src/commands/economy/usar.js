const shopService = require('../../services/shopService');

module.exports = {
  name: 'usar',
  async execute({ message, args }) {
    const senderId = message.author || message.from;
    const mentions = await message.getMentions();
    const targetId = mentions[0]?.id?._serialized || null;
    const itemQuery = args.filter((arg) => !arg.startsWith('@')).join(' ').trim();

    if (!itemQuery) {
      await message.reply('⚠️ Uso: *!usar [item]* o *!usar [item] @usuario*');
      return;
    }

    try {
      const tx = await shopService.useItem(senderId, itemQuery, targetId);

      if (tx.item.key === 'lottery_ticket') {
        if (tx.result === 'jackpot') {
          await message.reply('🎉 ¡PREMIO MAYOR! Ganaste **10,000 Yenes** con tu Ticket de Lotería.');
          return;
        }
        if (tx.result === 'win_1000') {
          await message.reply('🍀 ¡Ganaste **1,000 Yenes** con tu Ticket de Lotería!');
          return;
        }
        await message.reply('💨 Tu Ticket de Lotería no dio premio esta vez.');
        return;
      }

      if (tx.item.key === 'banana_peel') {
        await message.reply('🍌 ¡Trampa colocada! Le añadiste +15 minutos de cooldown de *!work* al objetivo.');
        return;
      }

      if (tx.item.key === 'energy_drink') {
        await message.reply('⚡ Energía al máximo: todos tus cooldowns de economía fueron reiniciados.');
        return;
      }

      if (tx.item.key === 'balaclava') {
        await message.reply('🥷 Te equipaste el Pasamontañas. Tu próximo *!rob* tendrá 80% de éxito.');
        return;
      }

      if (tx.item.key === 'double_espresso') {
        await message.reply('☕ ¡Boost activado! Durante las próximas 2 horas, *!work* paga x2.');
        return;
      }

      if (tx.item.key === 'usb') {
        await message.reply(`💾 Hackeo completado. Robaste **${tx.stolen} Yenes** del banco del objetivo.`);
      }
    } catch (error) {
      if (error.message === 'SHOP_ITEM_NOT_FOUND') {
        await message.reply('❌ Ese ítem no existe en la tienda.');
        return;
      }
      if (error.message === 'ITEM_NOT_OWNED') {
        await message.reply('❌ No tienes ese ítem en tu inventario.');
        return;
      }
      if (error.message === 'ITEM_NOT_MANUAL_USABLE') {
        await message.reply('ℹ️ Ese ítem es pasivo y se activa automáticamente cuando corresponde.');
        return;
      }
      if (error.message === 'ITEM_TARGET_REQUIRED') {
        await message.reply('⚠️ Ese ítem requiere objetivo. Ejemplo: *!usar platano @usuario*');
        return;
      }
      throw error;
    }
  }
};
