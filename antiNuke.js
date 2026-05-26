const WINDOW = 10000;
const THRESHOLDS = {
  bans: parseInt(process.env.ANTINUKE_BAN_THRESHOLD) || 3,
  kicks: parseInt(process.env.ANTINUKE_KICK_THRESHOLD) || 5,
  deletes: parseInt(process.env.ANTINUKE_DELETE_THRESHOLD) || 5,
};

function getTracker(client, userId) {
  if (!client.antiNukeTracker.has(userId))
    client.antiNukeTracker.set(userId, { bans: [], kicks: [], deletes: [] });
  return client.antiNukeTracker.get(userId);
}

function recordAction(client, userId, type) {
  const tracker = getTracker(client, userId);
  const now = Date.now();
  tracker[type] = tracker[type].filter(t => now - t < WINDOW);
  tracker[type].push(now);
  if (tracker[type].length >= THRESHOLDS[type])
    return { triggered: true, reason: `Anti-nuke: ${tracker[type].length} ${type} in 10s` };
  return { triggered: false, reason: null };
}

async function handleNuke(guild, userId, reason, logChannel) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;
    await member.roles.set([]);
    await member.timeout(24 * 60 * 60 * 1000, reason);
    if (logChannel) {
      const { chiEmbed } = require('./personality');
      await logChannel.send({ embeds: [chiEmbed('nuke', '💥 Anti-Nuke Triggered!',
        `Chizuru stopped a nuke attempt~!\n**User:** <@${userId}>\n**Reason:** ${reason}\n**Action:** Roles stripped + 24h timeout`)] });
    }
  } catch (err) { console.error('Anti-nuke error:', err); }
}

module.exports = { recordAction, handleNuke };
