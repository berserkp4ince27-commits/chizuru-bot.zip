const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const loaded = require(path.join(commandsPath, file));
  const cmds = Array.isArray(loaded) ? loaded : [loaded];
  for (const cmd of cmds) {
    if (cmd.data) {
      commands.push(cmd.data.toJSON());
      console.log(`📦 Loaded: /${cmd.data.name}`);
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n🌸 Deploying ${commands.length} slash commands for Chizuru~`);
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });
    console.log('✅ All commands deployed successfully! Chizuru is ready~');
  } catch (err) {
    console.error('❌ Deploy failed:', err);
  }
})();
