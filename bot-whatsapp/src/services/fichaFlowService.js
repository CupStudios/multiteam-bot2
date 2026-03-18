const fichaService = require('./fichaService');
const { normalizeId } = require('../utils/ids');

const sessionByUser = new Map();

const botPromptSnippets = [
  '¡Iniciando tu ficha!',
  'dime el nombre de tu **Personaje**',
  'dime la **Edad**',
  '¿Cuál es la **Sexualidad**',
  'Pasamos al Off Rol',
  '¿Cuáles son tus **Pronombres**',
  '¡Último paso!',
  'adjunta una imagen',
  '¿Es correcto? (s/n)',
  '¿Es la imagen/video correcto? (s/n)',
  'Entrada no válida',
  'Tu ficha ha sido completada y guardada'
];

function isBotPromptEcho(message, text) {
  if (!message.fromMe || !text) return false;
  return botPromptSnippets.some((snippet) => text.includes(snippet));
}


const retryMessages = {
  1: 'Vale, sin problema. Escribe de nuevo el nombre de tu **Personaje**:',
  2: 'Entendido. Dime de nuevo la **Edad** de tu personaje (On Rol):',
  3: 'Corrijámoslo. ¿Cuál es la **Sexualidad** de tu personaje?',
  4: 'Ok, escribe de nuevo tu **Edad** real (Off Rol):',
  5: 'De acuerdo. ¿Cuáles son tus **Pronombres**?',
  6: 'Vale, envíame la **imagen o video** correcta adjunta en tu próximo mensaje:'
};

function getSenderId(message) {
  return normalizeId(message.author || message.from);
}

function buildFichaText(respuestas) {
  return `┈┈┈  ֺ     ࣭   \`𝐅𝐈𝐂𝐇𝐀.\`   ࣭     ֺ  ┈┈┈\n\n.         ࿙࿚ ︶ ᧔ ☆ ᧓ ︶ ࿙࿚\n\n   𝅭  𝅭  ⎯⎯ㅤִㅤ⌗˙◇ 𖦹  \`𝘖ᑎ ᖇ𝘖ᒪ\` ꜝꜞ .\n\n    ʚ 𝐏𝘦𝘳𝘴𝘰𝘯𝘢𝘫𝘦 ౨ৎ \n𓈒  ׂ    🌸︪੭   ᮫   ✎: ${respuestas.personaje}\n\n    𖹭 ʚ  𝑬𝘥𝙖𝘥  ౨ৎ        \n𓈒  ׂ    🍂︪੭   ᮫   ✎: ${respuestas.edadOn}\n\n    𖹭 ʚ 𝗦𝑒𝑥υᥲᥣιძᥲ𝗱 ౨ৎ     \n    𓈒   ׂ    🌤︪੭   ᮫   ✎: ${respuestas.sexualidad}\n\n\n   𝅭  𝅭  ⎯⎯ㅤִㅤ⌗˙🌙 𖦹  \`𝘖ᖴᖴ ᖇ𝐎ᒪ\` ꜝꜞ ㅤִ \n\n𖹭         ɞ 𝑬𝘥𝙖𝘥  ౨ৎ        \n𓈒  ׂ    🧁੭   ᮫   ✎: ${respuestas.edadOff}\n\n         ɞ 𝗣𝑟𝑜ղσɱ𝖻𝗋ᥱ𝘀 ׂ  ੭୧   ᮫\n𓈒  ׂ    🌠੭   ᮫   ✎: ${respuestas.pronombres}\n\n︵͡⏜ ׄ  .  ︵͡⏜ ׄ  .  ︵͡⏜   ׄ  .  ︵͡⏜`;
}

function startSession(userId) {
  const normalized = normalizeId(userId);
  sessionByUser.set(normalized, {
    step: 1,
    answers: {},
    confirming: false,
    tempText: '',
    tempMedia: null
  });
}

function cancelSession(userId) {
  const normalized = normalizeId(userId);
  return sessionByUser.delete(normalized);
}

function hasSession(userId) {
  return sessionByUser.has(normalizeId(userId));
}

async function askNextQuestion(message, state) {
  switch (state.step) {
    case 1:
      await message.reply('¡Anotado! Ahora dime la **Edad** de tu personaje (On Rol):');
      return;
    case 2:
      await message.reply('Perfecto. ¿Cuál es la **Sexualidad** de tu personaje?');
      return;
    case 3:
      await message.reply('¡Genial! Pasamos al Off Rol. ¿Cuál es tu **Edad** real?');
      return;
    case 4:
      await message.reply('Casi terminamos. ¿Cuáles son tus **Pronombres**?');
      return;
    case 5:
      await message.reply('¡Último paso! Por favor, envíame la **imagen o video** de tu personaje adjunta en tu próximo mensaje.');
      return;
    default:
  }
}

async function finalizeProfile(client, message, userId, state) {
  const fichaFinal = buildFichaText(state.answers);
  const photoFileName = await fichaService.saveProfileImage(userId, state.tempMedia);

  await fichaService.setCharacterProfile(userId, state.answers.personaje, fichaFinal, photoFileName);
  sessionByUser.delete(userId);

  await client.sendMessage(message.from, state.tempMedia, {
    caption: fichaFinal,
    mentions: [userId]
  });

  await message.reply('✅ ¡Tu ficha ha sido completada y guardada exitosamente! Cualquiera puede verla usando *!verbio*.');
}

async function handleSessionMessage(client, message) {
  const senderId = getSenderId(message);
  if (!senderId || !hasSession(senderId)) return false;

  const state = sessionByUser.get(senderId);
  const text = (message.body || '').trim();

  // NOTE: owner/self-hosted mode can produce fromMe echoes for bot prompts.
  // Ignore those echoes so they don't get interpreted as ficha answers.
  if (isBotPromptEcho(message, text)) {
    return true;
  }

  if (text.startsWith('!')) {
    // Ignore other commands while waiting for ficha answers.
    return true;
  }

  if (state.confirming) {
    const conf = text.toLowerCase();

    if (['s', 'si', 'sí'].includes(conf)) {
      state.confirming = false;

      if (state.step === 1) state.answers.personaje = state.tempText;
      if (state.step === 2) state.answers.edadOn = state.tempText;
      if (state.step === 3) state.answers.sexualidad = state.tempText;
      if (state.step === 4) state.answers.edadOff = state.tempText;
      if (state.step === 5) state.answers.pronombres = state.tempText;

      if (state.step === 6) {
        await finalizeProfile(client, message, senderId, state);
        return true;
      }

      state.step += 1;
      await askNextQuestion(message, state);
      return true;
    }

    if (['n', 'no'].includes(conf)) {
      state.confirming = false;
      await message.reply(retryMessages[state.step]);
      return true;
    }

    await message.reply('⚠️ Entrada no válida. Por favor, responde únicamente con "*s*" (sí) o "*n*" (no). Si deseas detener todo, escribe *!cancelar*.');
    return true;
  }

  if (state.step >= 1 && state.step <= 5) {
    if (!text) {
      await message.reply('⚠️ Necesito un texto para continuar.');
      return true;
    }

    state.tempText = text;
    state.confirming = true;
    await message.reply(`Anoté: "${state.tempText}". ¿Es correcto? (s/n)`);
    return true;
  }

  if (state.step === 6) {
    if (!message.hasMedia) {
      await message.reply('⚠️ Por favor, adjunta una imagen o video para tu ficha (o manda !cancelar si te arrepentiste).');
      return true;
    }

    state.tempMedia = await message.downloadMedia();
    state.confirming = true;
    await message.reply('🖼️ Archivo multimedia recibido. ¿Es la imagen/video correcto? (s/n)');
    return true;
  }

  return true;
}

module.exports = {
  startSession,
  cancelSession,
  hasSession,
  handleSessionMessage,
  getSenderId
};
