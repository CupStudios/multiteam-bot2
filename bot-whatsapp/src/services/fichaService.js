const path = require('path');
const { JsonDb } = require('../database/db');
const { normalizeId } = require('../utils/ids');

// Ficha/business profile service. Extend this for RPG/profile commands.
const fichaDb = new JsonDb(path.resolve(__dirname, '../database/bios.json'), {
  users: {}
});

async function getFicha(userId) {
  const normalized = normalizeId(userId);
  const data = await fichaDb.load();
  return data.users?.[normalized] || null;
}

async function setBio(userId, bio) {
  const normalized = normalizeId(userId);

  await fichaDb.update(async (state) => {
    state.users[normalized] = state.users[normalized] || {
      createdAt: new Date().toISOString(),
      bio: ''
    };

    state.users[normalized].bio = bio;
    state.users[normalized].updatedAt = new Date().toISOString();
    return state;
  });
}

module.exports = {
  getFicha,
  setBio
};
