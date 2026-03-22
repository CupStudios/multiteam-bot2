const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

class CommandHandler {
  constructor() {
    this.commands = new Map();
  }

  // Loads all command modules recursively from src/commands.
  loadCommands() {
    const commandFiles = this.collectCommandFiles(config.commandsPath);

    for (const filePath of commandFiles) {
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);

      if (!command?.name || typeof command.execute !== 'function') {
        logger.warn(`Skipped invalid command module: ${filePath}`);
        continue;
      }

      this.commands.set(command.name.toLowerCase(), command);
    }

    logger.info(`Loaded ${this.commands.size} command(s)`);
  }

  collectCommandFiles(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.collectCommandFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // Parses and dispatches prefixed commands.
  async handleMessage(client, message) {
    const [rawName, ...args] = message.body.slice(config.prefix.length).trim().split(/\s+/);
    const commandName = (rawName || '').toLowerCase();

    if (!commandName) return;

    const command = this.commands.get(commandName);
    if (!command) return;

    try {
      const responseDelayMs = (Math.floor(Math.random() * 4) + 1) * 80;
      await new Promise((resolve) => setTimeout(resolve, responseDelayMs));
      await command.execute({ client, message, args });
    } catch (error) {
      logger.error(`Command failed: ${commandName}`, error);
      await message.reply('An unexpected error occurred while running that command.');
    }
  }
}

module.exports = { CommandHandler };
