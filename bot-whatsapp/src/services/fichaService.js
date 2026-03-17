const fs = require('fs');
const path = require('path');
const { JsonDb } = require('../database/db');
const { normalizeId } = require('../utils/ids');
const config = require('../config/config');

const fichaDb = new JsonDb(path.resolve(__dirname, '../database/bios.json'), {
  users: {}
});

function normalizeFichaShape(user = {}) {
  return {
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Keep `bio` for backward compatibility with the existing code.
    bio: user.bio || user.description || '',
    characterName: user.characterName || user.personaje || '',
    description: user.description || user.bio || '',
    photoFileName: user.photoFileName || user.fotoNombre || null
  };
}

async function ensureFicha(userId) {
  const normalized = normalizeId(userId);
  const data = await fichaDb.update(async (state) => {
    state.users[normalized] = normalizeFichaShape(state.users[normalized]);
    return state;
  });
  return data.users[normalized];
}

async function getFicha(userId) {
  const normalized = normalizeId(userId);
  await ensureFicha(normalized);
  const data = await fichaDb.load();
  return data.users[normalized] || null;
}

async function setBio(userId, bio) {
  const normalized = normalizeId(userId);

  await fichaDb.update(async (state) => {
    const current = normalizeFichaShape(state.users[normalized]);
    current.bio = bio;
    current.description = bio;
    state.users[normalized] = current;
    return state;
  });
}

async function setCharacterProfile(userId, characterName, description, photoFileName = null) {
  const normalized = normalizeId(userId);

  const next = await fichaDb.update(async (state) => {
    const current = normalizeFichaShape(state.users[normalized]);
    current.characterName = characterName;
    current.description = description;
    current.bio = description;

    if (photoFileName) {
      current.photoFileName = photoFileName;
    }

    state.users[normalized] = current;
    return state;
  });

  return next.users[normalized];
}

async function listCharacters() {
  const data = await fichaDb.load();
  return Object.values(data.users || {})
    .map((profile) => normalizeFichaShape(profile))
    .filter((profile) => Boolean(profile.characterName));
}

function getBiosMediaDirectory() {
  return path.resolve(config.mediaPath, 'bios');
}

async function saveProfileImage(userId, media) {
  const normalized = normalizeId(userId);
  const biosDir = getBiosMediaDirectory();
  await fs.promises.mkdir(biosDir, { recursive: true });

  const extension = media?.mimetype?.split('/')[1] || 'jpg';
  const fileName = `${normalized.split('@')[0]}.${extension}`;
  const filePath = path.join(biosDir, fileName);

  await fs.promises.writeFile(filePath, media.data, { encoding: 'base64' });

  return fileName;
}

function resolveProfileImagePath(fileName) {
  if (!fileName) return null;
  return path.join(getBiosMediaDirectory(), fileName);
}

module.exports = {
  ensureFicha,
  getFicha,
  setBio,
  setCharacterProfile,
  listCharacters,
  saveProfileImage,
  resolveProfileImagePath
};
