const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const fichaService = require('../../services/fichaService');

module.exports = {
  // NOTE: uploaded file was named `verbio.js`, but exported command `verficha`; we standardize on `verbio` to match help text.
  name: 'verbio',
  async execute({ client, message }) {
    const mentions = await message.getMentions();
    const targetId = mentions[0]?.id?._serialized || message.author || message.from;
    const contact = mentions[0] || await client.getContactById(targetId);
    const profile = await fichaService.getFicha(targetId);

    if (!profile?.description) {
      await message.reply(mentions.length > 0
        ? '⚠️ Esta persona no tiene una ficha registrada.'
        : '⚠️ Aún no tienes una ficha. ¡Crea una enviando *!ficha*!');
      return;
    }

    const userNumber = contact.id?.user || targetId.split('@')[0];
    const caption = `*Ficha de @${userNumber}*:\n\n${profile.description}`;

    if (profile.photoFileName) {
      const filePath = fichaService.resolveProfileImagePath(profile.photoFileName);

      if (filePath && fs.existsSync(filePath)) {
        const media = MessageMedia.fromFilePath(filePath);
        await message.reply(media, undefined, {
          caption,
          mentions: [targetId]
        });
        return;
      }

      await message.reply('⚠️ _Nota: La imagen se perdió en el servidor. Mostrando solo texto..._');
    }

    await message.reply(caption, undefined, { mentions: [targetId] });
  }
};
