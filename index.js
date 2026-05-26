const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

// Collections & state
client.commands = new Collection();
client.warnings  = new Map(); // userId -> [{ reason, timestamp }]
client.spamTracker = new Map(); // userId -> [{ time, content }]
client.antiNukeTracker = new Map(); // userId -> { bans[], kicks[], deletes[] }
client.raidTracker = []; // [timestamp] of recent joins
client.xpData = new Map(); // userId -> { xp, level }
client.jailedUsers = new Map(); // userId -> savedRoles[] // userIds currently jailed
client.tickets = new Map(); // channelId -> { userId, opened }

// Load events (supports single export or array)
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const loaded = require(path.join(eventsPath, file));
  const events = Array.isArray(loaded) ? loaded : [loaded];
  for (const event of events) {
    client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args, client));
  }
}

// Load commands (supports single export or array)
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const loaded = require(path.join(commandsPath, file));
  const cmds = Array.isArray(loaded) ? loaded : [loaded];
  for (const cmd of cmds) {
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
  }
}

client.login(process.env.DISCORD_TOKEN);
