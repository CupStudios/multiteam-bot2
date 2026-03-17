You are an expert Node.js backend engineer.

Create a production-ready scaffolding for a WhatsApp bot using the library "whatsapp-web.js".

The goal is to generate a clean, scalable architecture where I will only need to implement the command logic later.

Requirements:

Environment
- Node.js project
- OS target: Ubuntu Server 24.04
- Runtime: Node 20+
- Bot will run on a VPS with:
  - 2 GB RAM
  - 1 vCore
  - 50 GB SSD
- Must be optimized for low memory usage.

Libraries
- whatsapp-web.js
- puppeteer
- fs
- path

Do NOT add unnecessary frameworks.

Architecture

Create the following folder structure:

bot-whatsapp/
│
├─ index.js
├─ package.json
│
├─ src/
│  │
│  ├─ core/
│  │   bot.js
│  │   client.js
│  │   commandHandler.js
│  │
│  ├─ commands/
│  │   economy/
│  │   roleplay/
│  │   utility/
│  │
│  ├─ events/
│  │   messageCreate.js
│  │   groupJoin.js
│  │
│  ├─ services/
│  │   userService.js
│  │   fichaService.js
│  │   economyService.js
│  │
│  ├─ database/
│  │   db.js
│  │   bios.json
│  │   economy.json
│  │
│  ├─ utils/
│  │   mentions.js
│  │   ids.js
│  │   logger.js
│  │
│  └─ config/
│      config.js
│
├─ media/
│  └─ bios/

Implementation details

1. index.js
Entry point that starts the bot.

2. client.js
Initialize whatsapp-web.js Client using LocalAuth.

Use puppeteer with arguments:
- --no-sandbox
- --disable-setuid-sandbox
- --disable-dev-shm-usage

3. commandHandler.js
Responsible for:
- loading commands dynamically from /commands
- executing commands starting with "!"

Command interface:

module.exports = {
  name: "commandname",
  async execute({ client, message, args }) {}
}

4. events/messageCreate.js
Handles message events and sends commands to the command handler.

Ignore:
- bot messages
- messages without prefix

5. services layer
Business logic must live in services, not commands.

Example:
fichaService.js
economyService.js

Commands should only call services.

6. database/db.js

Create a simple JSON database wrapper.

Features:
- load JSON
- save JSON
- prevent overwriting errors
- async safe writes

7. utils/mentions.js

Provide a universal way to get the target user:

function getTargetUser(message)

Logic:
- if message.mentionedIds exists → return that
- else return message.author or message.from

8. utils/ids.js

Create a normalizeId function.

Convert:

52123456789@lid
52123456789@c.us

into:

52123456789@c.us

9. logger.js

Simple console logger with timestamps.

10. Example command

Create a sample command:

commands/utility/ping.js

Example usage:

!ping

Reply:

"Pong!"

11. package.json

Include scripts:

start
dev

Dependencies:

whatsapp-web.js
puppeteer

12. Performance considerations

Optimize for memory usage because the bot will run continuously on a VPS.

Avoid:
- memory leaks
- large in-memory caches

13. Documentation

Add comments in the code explaining:

- folder responsibility
- command creation
- service usage

Goal

The result should be a ready-to-run WhatsApp bot where I only need to:

1) create new command files in /commands
2) implement logic in /services

Everything else must already be wired together.

Output

Generate the full project files with their content.
