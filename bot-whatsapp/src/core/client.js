const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('../config/config');

// Creates a WhatsApp Web client tuned for low-memory VPS usage.
function createClient() {
  return new Client({
    authStrategy: new LocalAuth({
      dataPath: config.authPath
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--no-zygote',
        '--single-process'
      ]
    },
    webVersionCache: {
      type: 'local',
      path: config.webVersionCachePath
    }
  });
}

module.exports = { createClient };
