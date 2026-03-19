const os = require('os');
const economyService = require('../../services/economyService');

function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

function formatPingMs(message) {
  if (!message.timestamp) return 'N/D';
  const sentMs = Number(message.timestamp) * 1000;
  if (!Number.isFinite(sentMs)) return 'N/D';
  return `${Math.max(0, Date.now() - sentMs)} ms`;
}

module.exports = {
  name: 'status',
  async execute({ client, message }) {
    const senderId = message.author || message.from;
    const status = await economyService.getStatus(senderId);

    const activeItems = status.activeItems.length > 0
      ? status.activeItems.map((item) => `• ${item.name}: ${item.remaining.minutes}m ${item.remaining.seconds}s`).join('\n')
      : '• Ninguno';
    const inventoryLines = Object.entries(status.inventory || {})
      .map(([key, qty]) => `• ${key}: x${qty}`)
      .join('\n') || '• Vacío';

    const info = [
      '📊 *ESTADO DEL BOT*',
      '',
      `• Ping actual: *${formatPingMs(message)}*`,
      `• Uptime: *${formatUptime(process.uptime())}*`,
      `• Plataforma: *${os.platform()}*`,
      `• RAM usada: *${Math.round(process.memoryUsage().rss / (1024 * 1024))} MB*`,
      `• WA Web: *${client.info?.wid?.user || 'N/D'}*`,
      '',
      '🧪 *Tus efectos activos*',
      activeItems,
      '',
      `💴 Billetera: *${status.wallet}*`,
      `🏛️ Banco: *${status.bank}*`,
      `💰 Total: *${status.total}*`,
      `⚙️ Multiplicador de cooldown: *x${status.cooldownMultiplier}*`,
      '',
      '🎒 *Inventario*',
      inventoryLines
    ];

    await message.reply(info.join('\n'));
  }
};
