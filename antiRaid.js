const THRESHOLD = parseInt(process.env.ANTIRAID_JOIN_THRESHOLD) || 10;
const WINDOW = parseInt(process.env.ANTIRAID_JOIN_WINDOW_MS) || 10000;

let raidMode = false;
let raidModeTimeout = null;

async function checkRaid(client, guild, member) {
  const now = Date.now();
  client.raidTracker = client.raidTracker.filter(t => now - t < WINDOW);
  client.raidTracker.push(now);

  if (client.raidTracker.length >= THRESHOLD && !raidMode) {
    raidMode = true;
    await activateLockdown(guild, client);

    // Auto-disable lockdown after 5 minutes
    if (raidModeTimeout) clearTimeout(raidModeTimeout);
    raidModeTimeout = setTimeout(() => deactivateLockdown(guild, client), 5 * 60 * 1000);
  }

  // Kick joiners during active raid
  if (raidMode) {
    try {
      await member.kick('Anti-raid: Server is in lockdown mode');
    } catch (_) {}
  }
}

async function activateLockdown(guild, client) {
  const logChannelId = process.env.MOD_LOG_CHANNEL_ID;
  const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;

  // Set all text channels to members-cannot-send
  for (const [, channel] of guild.channels.cache.filter(c => c.isTextBased())) {
    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
    } catch (_) {}
  }

  if (logChannel) {
    const { chiEmbed, personality } = require('./personality');
    await logChannel.send({
      content: '@here',
      embeds: [chiEmbed('nuke', '🚨 RAID DETECTED — LOCKDOWN ACTIVE',
        personality.raidDetected() + '\n\nAll channels locked! Auto-unlocking in 5 minutes~')]
    }).catch(() => {});
  }
}

async function deactivateLockdown(guild, client) {
  raidMode = false;
  client.raidTracker = [];

  for (const [, channel] of guild.channels.cache.filter(c => c.isTextBased())) {
    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
    } catch (_) {}
  }

  const logChannelId = process.env.MOD_LOG_CHANNEL_ID;
  const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;
  if (logChannel) {
    const { chiEmbed } = require('./personality');
    await logChannel.send({ embeds: [chiEmbed('success', '✅ Lockdown Lifted',
      'The raid seems to be over~ Chizuru has unlocked all channels! 🌸')] }).catch(() => {});
  }
}

function isRaidMode() { return raidMode; }

module.exports = { checkRaid, activateLockdown, deactivateLockdown, isRaidMode };
