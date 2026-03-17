// Commands should remain thin and delegate real logic to services.
module.exports = {
  name: 'ping',
  async execute({ message }) {
    await message.reply('Pong!');
  }
};
