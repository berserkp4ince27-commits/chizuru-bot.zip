const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { chiEmbed, personality } = require('../services/personality');
const { getLogChannel } = require('../services/modActions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jail')
    .setDescription('🔒 Send a user to jail~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User to jail').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)),

  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');
    const jailRoleId = process.env.JAIL_ROLE_ID;
    const jailChannelId = process.env.JAIL_CHANNEL_ID;

    if (!target) return interaction.reply({ embeds: [chiEmbed('error', '❌ Oops~', 'User not found!')], ephemeral: true });
    if (!jailRoleId) return interaction.reply({ embeds: [chiEmbed('error', '❌ Oops~', 'JAIL_ROLE_ID not set in .env!')], ephemeral: true });

    // Save their roles and assign jail role
    const savedRoles = target.roles.cache.filter(r => r.id !== interaction.guild.roles.everyone.id).map(r => r.id);
    client.jailedUsers.set(target.id, savedRoles);

    try {
      await target.roles.set([jailRoleId], reason);
      client.jailedUsers.add(target.id);
    } catch {
      return interaction.reply({ embeds: [chiEmbed('error', '❌ Oops~', "Chizuru couldn't jail that user! Check my permissions~")], ephemeral: true });
    }

    // Notify jail channel
    if (jailChannelId) {
      const jailChannel = interaction.guild.channels.cache.get(jailChannelId);
      if (jailChannel) await jailChannel.send({ embeds: [chiEmbed('jail', '🔒 You\'ve been Jailed~!', personality.jailed(target.id, reason))] }).catch(() => {});
    }

    await interaction.reply({ embeds: [chiEmbed('jail', '🔒 Jailed~!', personality.jailed(target.id, reason))] });

    const log = getLogChannel(interaction.guild);
    if (log) await log.send({ embeds: [chiEmbed('jail', '🔒 Jail Action', null, [
      { name: 'User', value: `<@${target.id}>`, inline: true },
      { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Reason', value: reason },
    ])] }).catch(() => {});
  },
};
