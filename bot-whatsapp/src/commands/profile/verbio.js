const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const fichaService = require('../../services/fichaService');
const { getTargetUser } = require('../../utils/mentions');

module.exports = {
  // NOTE: uploaded file was named `verbio.js`, but exported command `verficha`; we standardize on `verbio` to match help text.
  name: 'verbio',
  async execute({ client, message }) {
    // NOTE: `getMentions()` can be empty in some whatsapp-web.js situations.
    // We prioritize `mentionedIds` via `getTargetUser(...)` for reliable mention resolution.
    const targetId = getTargetUser(message);
    const isMentionQuery = Array.isArray(message.mentionedIds) && message.mentionedIds.length > 0;

    const profile = await fichaService.getFicha(targetId);

    if (!profile?.description) {
      await message.reply(isMentionQuery
        ? '⚠️ Esta persona no tiene una ficha registrada.'
        : '⚠️ Aún no tienes una ficha. ¡Crea una enviando *!ficha*!');
      return;
    }

    let userNumber = targetId.split('@')[0];

    try {
      const contact = await client.getContactById(targetId);
      userNumber = contact?.id?.user || userNumber;
    } catch {
      // Ignore contact lookup failures and fallback to numeric id.
    }

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
