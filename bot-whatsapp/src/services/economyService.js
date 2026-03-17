const path = require('path');
const { JsonDb } = require('../database/db');
const { normalizeId } = require('../utils/ids');

const economyDb = new JsonDb(path.resolve(__dirname, '../database/economy.json'), {
  users: {}
});

function createDefaultEconomyUser() {
  return {
    wallet: 0,
    bank: 0,
    dailyStreak: 0,
    lastDaily: 0,
    lastWork: 0,
    lastRob: 0,
    lastRoll: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function normalizeEconomyUserShape(user = {}) {
  return {
    ...createDefaultEconomyUser(),
    ...user,
    // Backward compatibility: older builds stored only `coins`.
    wallet: typeof user.wallet === 'number' ? user.wallet : (typeof user.coins === 'number' ? user.coins : 0),
    bank: typeof user.bank === 'number' ? user.bank : 0,
    dailyStreak: typeof user.dailyStreak === 'number' ? user.dailyStreak : 0,
    lastDaily: typeof user.lastDaily === 'number' ? user.lastDaily : 0,
    lastWork: typeof user.lastWork === 'number' ? user.lastWork : 0,
    lastRob: typeof user.lastRob === 'number' ? user.lastRob : 0,
    lastRoll: typeof user.lastRoll === 'number' ? user.lastRoll : 0,
    updatedAt: new Date().toISOString()
  };
}

async function ensureUser(userId) {
  const normalized = normalizeId(userId);

  const data = await economyDb.update(async (state) => {
    state.users[normalized] = normalizeEconomyUserShape(state.users[normalized]);
    return state;
  });

  return data.users[normalized];
}

async function getUser(userId) {
  const normalized = normalizeId(userId);
  await ensureUser(normalized);
  const data = await economyDb.load();
  return data.users[normalized];
}

async function getBalance(userId) {
  const user = await getUser(userId);
  return user.wallet + user.bank;
}

async function getWalletBank(userId) {
  const user = await getUser(userId);
  return { wallet: user.wallet, bank: user.bank, total: user.wallet + user.bank };
}

async function transferToBank(userId, amountText) {
  const normalized = normalizeId(userId);

  const data = await economyDb.update(async (state) => {
    const user = normalizeEconomyUserShape(state.users[normalized]);
    const amount = amountText === 'all' ? user.wallet : Number.parseInt(amountText, 10);

    if (!amount || amount <= 0 || amount > user.wallet) {
      throw new Error('INVALID_DEPOSIT');
    }

    user.wallet -= amount;
    user.bank += amount;
    user.updatedAt = new Date().toISOString();

    state.users[normalized] = user;
    state.lastTransaction = { type: 'deposit', userId: normalized, amount, at: user.updatedAt };
    return state;
  });

  return data.lastTransaction.amount;
}

async function transferToWallet(userId, amountText) {
  const normalized = normalizeId(userId);

  const data = await economyDb.update(async (state) => {
    const user = normalizeEconomyUserShape(state.users[normalized]);
    const amount = amountText === 'all' ? user.bank : Number.parseInt(amountText, 10);

    if (!amount || amount <= 0 || amount > user.bank) {
      throw new Error('INVALID_WITHDRAW');
    }

    user.bank -= amount;
    user.wallet += amount;
    user.updatedAt = new Date().toISOString();

    state.users[normalized] = user;
    state.lastTransaction = { type: 'withdraw', userId: normalized, amount, at: user.updatedAt };
    return state;
  });

  return data.lastTransaction.amount;
}

async function claimDaily(userId) {
  const normalized = normalizeId(userId);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  return economyDb.update(async (state) => {
    const user = normalizeEconomyUserShape(state.users[normalized]);

    if (now - user.lastDaily < oneDay) {
      const hoursLeft = Math.ceil((oneDay - (now - user.lastDaily)) / (1000 * 60 * 60));
      throw new Error(`DAILY_COOLDOWN:${hoursLeft}`);
    }

    user.dailyStreak = now - user.lastDaily < oneDay * 2 ? user.dailyStreak + 1 : 1;
    const reward = 500 + user.dailyStreak * 50;

    user.wallet += reward;
    user.lastDaily = now;
    user.updatedAt = new Date().toISOString();

    state.users[normalized] = user;
    state.lastTransaction = { type: 'daily', userId: normalized, reward, streak: user.dailyStreak, at: user.updatedAt };
    return state;
  }).then((state) => state.lastTransaction);
}

async function work(userId) {
  const normalized = normalizeId(userId);
  const now = Date.now();
  const cooldown = 10 * 60 * 1000;

  return economyDb.update(async (state) => {
    const user = normalizeEconomyUserShape(state.users[normalized]);

    if (now - user.lastWork < cooldown) {
      const minutesLeft = Math.ceil((cooldown - (now - user.lastWork)) / (1000 * 60));
      throw new Error(`WORK_COOLDOWN:${minutesLeft}`);
    }

    const salary = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
    user.wallet += salary;
    user.lastWork = now;
    user.updatedAt = new Date().toISOString();

    state.users[normalized] = user;
    state.lastTransaction = { type: 'work', userId: normalized, salary, at: user.updatedAt };
    return state;
  }).then((state) => state.lastTransaction);
}

async function roll(userId) {
  const normalized = normalizeId(userId);
  const now = Date.now();
  const cooldown = 2 * 60 * 1000;

  return economyDb.update(async (state) => {
    const user = normalizeEconomyUserShape(state.users[normalized]);

    if (now - user.lastRoll < cooldown) {
      const minutesLeft = Math.ceil((cooldown - (now - user.lastRoll)) / (1000 * 60));
      throw new Error(`ROLL_COOLDOWN:${minutesLeft}`);
    }

    const success = Math.random() < 0.4;
    if (success) {
      const reward = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
      user.wallet += reward;
      state.lastTransaction = { type: 'roll', userId: normalized, success, reward, at: new Date().toISOString() };
    } else {
      const fine = 200;
      user.wallet = Math.max(0, user.wallet - fine);
      state.lastTransaction = { type: 'roll', userId: normalized, success, fine, at: new Date().toISOString() };
    }

    user.lastRoll = now;
    user.updatedAt = new Date().toISOString();
    state.users[normalized] = user;
    return state;
  }).then((state) => state.lastTransaction);
}

async function rob(thiefId, victimId) {
  const normalizedThief = normalizeId(thiefId);
  const normalizedVictim = normalizeId(victimId);
  const now = Date.now();
  const cooldown = 30 * 60 * 1000;

  if (normalizedThief === normalizedVictim) {
    throw new Error('ROB_SELF');
  }

  return economyDb.update(async (state) => {
    const thief = normalizeEconomyUserShape(state.users[normalizedThief]);
    const victim = normalizeEconomyUserShape(state.users[normalizedVictim]);

    if (now - thief.lastRob < cooldown) {
      throw new Error('ROB_COOLDOWN');
    }

    if (victim.wallet < 100) {
      throw new Error('ROB_POOR_TARGET');
    }

    const success = Math.random() < 0.4;

    if (success) {
      const stolen = Math.floor(victim.wallet * (Math.random() * 0.5));
      thief.wallet += stolen;
      victim.wallet -= stolen;
      state.lastTransaction = { type: 'rob', thiefId: normalizedThief, victimId: normalizedVictim, success, stolen, at: new Date().toISOString() };
    } else {
      const fine = 200;
      thief.wallet = Math.max(0, thief.wallet - fine);
      state.lastTransaction = { type: 'rob', thiefId: normalizedThief, victimId: normalizedVictim, success, fine, at: new Date().toISOString() };
    }

    thief.lastRob = now;
    thief.updatedAt = new Date().toISOString();
    victim.updatedAt = new Date().toISOString();

    state.users[normalizedThief] = thief;
    state.users[normalizedVictim] = victim;
    return state;
  }).then((state) => state.lastTransaction);
}

async function getLeaderboard(limit = 10) {
  const data = await economyDb.load();

  return Object.entries(data.users || {})
    .map(([id, user]) => {
      const normalized = normalizeEconomyUserShape(user);
      return {
        id,
        total: normalized.wallet + normalized.bank
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

module.exports = {
  ensureUser,
  getUser,
  getBalance,
  getWalletBank,
  transferToBank,
  transferToWallet,
  claimDaily,
  work,
  roll,
  rob,
  getLeaderboard
};
