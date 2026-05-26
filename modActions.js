const { personality, chiEmbed } = require('./personality');
const MAX_WARNS = 3;

function addWarning(client, userId, reason) {
  if (!client.warnings.has(userId)) client.warnings.set(userId, []);
  client.warnings.get(userId).push({ reason, timestamp: new Date().toISOString() });
  return client.warnings.get(userId).length;
}

function getWarnings(client, userId) { return client.warnings.get(userId) || []; }
function clearWarnings(client, userId) { client.warnings.delete(userId); }

function getLogChannel(guild) {
  const id = process.env.MOD_LOG_CHANNEL_ID;
  return id ? guild.channels.cache.get(id) : null;
}

async function takeAction(message, severity, reason, client) {
  const member = message.member;
  if (!member) return;
  const userId = member.id;
  const logChannel = getLogChannel(message.guild);

  try { await message.delete(); } catch (_) {}

  let action = '';

  if (severity === 'high') {
    try {
      await member.ban({ reason, deleteMessageSeconds: 86400 });
      action = '🔨 Banned';
      await message.channel.send({ embeds: [chiEmbed('error', '🔨 User Banned~!', personality.banned(userId, reason))] })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 10000)).catch(() => {});
    } catch (_) {}

  } else if (severity === 'medium') {
    const count = addWarning(client, userId, reason);
    if (count >= MAX_WARNS) {
      try {
        await member.kick(reason);
        action = `👢 Kicked (${count} warnings)`;
        clearWarnings(client, userId);
        await message.channel.send({ embeds: [chiEmbed('warn', '👢 User Kicked~!', personality.kicked(userId, reason))] })
          .then(m => setTimeout(() => m.delete().catch(() => {}), 10000)).catch(() => {});
      } catch (_) {}
    } else {
      try {
        await member.timeout(10 * 60 * 1000, reason);
        action = `⏱️ Timeout 10m (Warning ${count}/${MAX_WARNS})`;
        await message.channel.send({ embeds: [chiEmbed('warn', '🔇 Timeout~!', personality.muted(userId, '10 minutes', reason))] })
          .then(m => setTimeout(() => m.delete().catch(() => {}), 10000)).catch(() => {});
      } catch (_) {}
    }
  } else {
    const count = addWarning(client, userId, reason);
    action = `⚠️ Warning ${count}/${MAX_WARNS}`;
    await message.channel.send({ embeds: [chiEmbed('warn', '⚠️ Warning~!', personality.warned(userId, reason, count))] })
      .then(m => setTimeout(() => m.delete().catch(() => {}), 8000)).catch(() => {});
  }

  if (logChannel) {
    await logChannel.send({ embeds: [chiEmbed(
      severity === 'high' ? 'error' : 'warn',
      '🤖 AI AutoMod Action',
      null,
      [
        { name: 'User', value: `<@${userId}>`, inline: true },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Action', value: action, inline: true },
        { name: 'Reason', value: reason },
        { name: 'Severity', value: severity.toUpperCase(), inline: true },
      ]
    )] }).catch(() => {});
  }
}

module.exports = { addWarning, getWarnings, clearWarnings, takeAction, getLogChannel };
