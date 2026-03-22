function isTransientPuppeteerReplyError(error) {
  if (!error) return false;
  const text = `${error.name || ''} ${error.message || ''}`.toLowerCase();
  return text.includes('protocol error') && text.includes('promise was collected');
}

async function safeReply(message, content, options) {
  try {
    return await message.reply(content, undefined, options);
  } catch (error) {
    if (!isTransientPuppeteerReplyError(error)) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    return message.reply(content, undefined, options);
  }
}

module.exports = { safeReply, isTransientPuppeteerReplyError };
