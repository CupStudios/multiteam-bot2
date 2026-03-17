const path = require('path');
const { JsonDb } = require('../../database/db');

const biosDb = new JsonDb(path.resolve(__dirname, '../../database/bios.json'), { users: {} });

module.exports = {
  name: 'personajes',
  async execute({ message }) {
    const data = await biosDb.load();
    const ids = Object.keys(data.users || {});

    if (ids.length === 0) {
      await message.reply('🎭 No hay personajes registrados todavía.');
      return;
    }

    let text = '🎭 *LISTA DE PERSONAJES* 🎭\n\n';

    for (const id of ids) {
      const profile = data.users[id];
      const displayName = profile.characterName || profile.personaje || 'Sin nombre (usa !setbio)';
      text += `• ${displayName}\n`;
    }

    text += '\n> 💡 Usa *!verbio @usuario* para ver la ficha completa.';
    await message.reply(text);
  }
};
