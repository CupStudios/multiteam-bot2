const path = require('path');

// Central configuration to keep runtime tuning and paths in one place.
module.exports = {
  prefix: '!',
  authPath: path.resolve(__dirname, '../../.wwebjs_auth'),
  webVersionCachePath: path.resolve(__dirname, '../../.wwebjs_cache'),
  qrRawPath: path.resolve(__dirname, '../../.last-qr.txt'),
  commandsPath: path.resolve(__dirname, '../commands'),
  dbPath: path.resolve(__dirname, '../database'),
  mediaPath: path.resolve(__dirname, '../../media')
};
