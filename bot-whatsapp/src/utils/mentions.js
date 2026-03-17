const { normalizeId } = require('./ids');

// Gets the most relevant target user from a message.
function getTargetUser(message) {
  const mentioned = Array.isArray(message.mentionedIds) ? message.mentionedIds : [];

  if (mentioned.length > 0) {
    return normalizeId(mentioned[0]);
  }

  return normalizeId(message.author || message.from);
}

module.exports = { getTargetUser };
