const path = require('path');
const { JsonDb } = require('../database/db');
const { normalizeId } = require('../utils/ids');

// Service layer: user-centric operations should live here, not in commands.
const usersDb = new JsonDb(path.resolve(__dirname, '../database/bios.json'), {
  users: {}
});

async function ensureUser(userId) {
  const normalized = normalizeId(userId);

  const data = await usersDb.update(async (state) => {
    if (!state.users[normalized]) {
      state.users[normalized] = {
        createdAt: new Date().toISOString(),
        bio: ''
      };
    }
    return state;
  });

  return data.users[normalized];
}

module.exports = { ensureUser };
