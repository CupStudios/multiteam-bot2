// Utility helpers to normalize WhatsApp user/chat IDs.
function normalizeId(id) {
  if (!id || typeof id !== 'string') return id;
  return id.replace(/@lid$/i, '@c.us');
}

module.exports = { normalizeId };
