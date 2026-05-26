const { checkRaid } = require('../services/antiRaid');
const { chiEmbed, personality } = require('../services/personality');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const { guild } = member;

    // Anti-raid check
    await checkRaid(client, guild, member);

    // Autorole
    const roleId = process.env.AUTOROLE_ID;
    if (roleId) {
      const role = guild.roles.cache.get(roleId);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // Welcome message
    const welcomeId = process.env.WELCOME_CHANNEL_ID;
    if (welcomeId) {
      const channel = guild.channels.cache.get(welcomeId);
      if (channel) {
        await channel.send({
          embeds: [chiEmbed('success', '🌸 New Member~!',
            personality.welcome(member.id, guild.name),
            [
              { name: 'Members', value: `${guild.memberCount}`, inline: true },
              { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            ]
          )]
        }).catch(() => {});
      }
    }
  },
};
