const { recordAction, handleNuke } = require('../services/antiNuke');

function getLog(guild) {
  const id = process.env.MOD_LOG_CHANNEL_ID;
  return id ? guild.channels.cache.get(id) : null;
}

const guildBanAdd = {
  name: 'guildBanAdd',
  async execute(ban, client) {
    const logs = await ban.guild.fetchAuditLogs({ type: 22, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || entry.executor.id === client.user.id) return;
    const r = recordAction(client, entry.executor.id, 'bans');
    if (r.triggered) await handleNuke(ban.guild, entry.executor.id, r.reason, getLog(ban.guild));
  },
};

const guildMemberRemove = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const logs = await member.guild.fetchAuditLogs({ type: 20, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 3000 || entry.executor.id === client.user.id) return;
    const r = recordAction(client, entry.executor.id, 'kicks');
    if (r.triggered) await handleNuke(member.guild, entry.executor.id, r.reason, getLog(member.guild));
  },
};

const channelDelete = {
  name: 'channelDelete',
  async execute(channel, client) {
    if (!channel.guild) return;
    const logs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null);
    const entry = logs?.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 3000 || entry.executor.id === client.user.id) return;
    const r = recordAction(client, entry.executor.id, 'deletes');
    if (r.triggered) await handleNuke(channel.guild, entry.executor.id, r.reason, getLog(channel.guild));
  },
};

module.exports = [guildBanAdd, guildMemberRemove, channelDelete];
