const path = require('path');
const { JsonDb } = require('../database/db');
const { normalizeId } = require('../utils/ids');

// Economy service keeps currency logic centralized.
const economyDb = new JsonDb(path.resolve(__dirname, '../database/economy.json'), {
  users: {}
});

async function getBalance(userId) {
  const normalized = normalizeId(userId);
  const data = await economyDb.load();
  return data.users?.[normalized]?.coins || 0;
}

async function addCoins(userId, amount) {
  const normalized = normalizeId(userId);

  const data = await economyDb.update(async (state) => {
    state.users[normalized] = state.users[normalized] || { coins: 0 };
    state.users[normalized].coins += amount;
    state.users[normalized].updatedAt = new Date().toISOString();
    return state;
  });

  return data.users[normalized].coins;
}

module.exports = {
  getBalance,
  addCoins
};
