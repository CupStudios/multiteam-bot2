module.exports = {
  name: 'pay',
  execute: async ({ message, args, remitenteId, economia, guardarDatos, ARCHIVO_ECONOMIA, initUser }) => {
    const menciones = await message.getMentions();
    const monto = parseInt(args[1] || args[0]); // Maneja si ponen !pay @user 100 o !pay 100 @user

    if (!menciones.length || isNaN(monto) || monto <= 0) {
      return message.reply('⚠️ Uso: *!pay @usuario [cantidad]*');
    }

    const receptorId = initUser(menciones[0].id);
    const userEmisor = economia[remitenteId];

    if (userEmisor.wallet < monto) {
      return message.reply('❌ No tienes suficiente dinero en tu billetera.');
    }

    // Proceso de transferencia
    userEmisor.wallet -= monto;
    economia[receptorId].wallet += monto;

    guardarDatos(ARCHIVO_ECONOMIA, economia);
    
    return message.reply(`💸 Has enviado **${monto} Yenes** a @${menciones[0].id.user}.`, {
      mentions: [menciones[0].id._serialized]
    });
  }
};
