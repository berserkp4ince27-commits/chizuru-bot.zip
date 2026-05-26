const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { chiEmbed, personality } = require('../services/personality');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unjail')
    .setDescription('🗝️ Release a user from jail~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User to unjail').setRequired(true)),

  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ embeds: [chiEmbed('error', '❌', 'User not found!')], ephemeral: true });

    const savedRoles = client.jailedUsers.get ? client.jailedUsers.get(target.id) : null;
    client.jailedUsers.delete(target.id);

    try {
      if (savedRoles && savedRoles.length) {
        await target.roles.set(savedRoles);
      } else {
        const jailRoleId = process.env.JAIL_ROLE_ID;
        if (jailRoleId) await target.roles.remove(jailRoleId);
      }
    } catch {
      return interaction.reply({ embeds: [chiEmbed('error', '❌', "Chizuru couldn't unjail that user!")], ephemeral: true });
    }

    await interaction.reply({ embeds: [chiEmbed('success', '🗝️ Released~!', personality.unjailed(target.id))] });
  },
};
