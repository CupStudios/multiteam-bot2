const fs = require('fs');
const path = require('path');

/**
 * Minimal JSON database wrapper.
 * - Lazy loads files
 * - Uses atomic write (tmp + rename)
 * - Queues writes to avoid race conditions
 */
class JsonDb {
  constructor(filePath, defaultData = {}) {
    this.filePath = filePath;
    this.defaultData = defaultData;
    this.writeQueue = Promise.resolve();
  }

  async ensureFile() {
    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    try {
      await fs.promises.access(this.filePath, fs.constants.F_OK);
    } catch {
      await this.save(this.defaultData);
    }
  }

  async load() {
    await this.ensureFile();
    const content = await fs.promises.readFile(this.filePath, 'utf8');

    if (!content.trim()) {
      return this.defaultData;
    }

    try {
      return JSON.parse(content);
    } catch {
      // Prevent crash if file gets corrupted; keep service alive.
      return this.defaultData;
    }
  }

  async save(data) {
    this.writeQueue = this.writeQueue.then(async () => {
      const tempPath = `${this.filePath}.tmp`;
      const payload = `${JSON.stringify(data, null, 2)}\n`;

      await fs.promises.writeFile(tempPath, payload, 'utf8');
      await fs.promises.rename(tempPath, this.filePath);
    });

    return this.writeQueue;
  }

  async update(updaterFn) {
    const current = await this.load();
    const next = await updaterFn(current);
    await this.save(next);
    return next;
  }
}

module.exports = { JsonDb };
