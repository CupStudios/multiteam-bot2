const fichaService = require('../../services/fichaService');

module.exports = {
  name: 'setbio',
  async execute({ message }) {
    const senderId = message.author || message.from;
    const content = message.body.slice('!setbio'.length).trim();
    const [name, ...descArray] = content.split('|');
    const description = descArray.join('|').trim();

    if (!name || !description) {
      await message.reply('⚠️ Formato incorrecto. Usa:\n*!setbio Nombre del Personaje | Descripción*');
      return;
    }

    let photoFileName = null;
    if (message.hasMedia) {
      const media = await message.downloadMedia();
      photoFileName = await fichaService.saveProfileImage(senderId, media);
    }

    await fichaService.setCharacterProfile(senderId, name.trim(), description, photoFileName);

    await message.reply(`✅ Personaje **${name.trim()}** registrado con éxito.`);
  }
};
