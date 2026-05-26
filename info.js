const { SlashCommandBuilder } = require('discord.js');
const { chiEmbed } = require('../services/personality');
const { getWarnings } = require('../services/modActions');

const userinfo = {
  data: new SlashCommandBuilder()
    .setName('userinfo').setDescription('🌸 Get info about a user~')
    .addUserOption(o => o.setName('user').setDescription('User (optional)')),
  async execute(interaction, client) {
    const target = interaction.options.getMember('user') || interaction.member;
    const user = target.user;
    const warns = getWarnings(client, user.id).length;
    const xpData = client.xpData.get(user.id) || { xp: 0, level: 0 };
    const jailed = client.jailedUsers.has(user.id);

    await interaction.reply({ embeds: [chiEmbed('info', `🌸 ${user.username}'s Info~`, null, [
      { name: '🆔 ID', value: user.id, inline: true },
      { name: '📅 Joined Server', value: `<t:${Math.floor(target.joinedTimestamp/1000)}:R>`, inline: true },
      { name: '🎂 Account Created', value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`, inline: true },
      { name: '⚠️ Warnings', value: `${warns}`, inline: true },
      { name: '⭐ Level', value: `${xpData.level}`, inline: true },
      { name: '🔒 Jailed', value: jailed ? 'Yes 💢' : 'No 🌸', inline: true },
      { name: '🎭 Top Role', value: `${target.roles.highest}`, inline: true },
    ])], ephemeral: false });
  },
};

const serverinfo = {
  data: new SlashCommandBuilder()
    .setName('serverinfo').setDescription('🏰 Get info about this server~'),
  async execute(interaction) {
    const g = interaction.guild;
    await g.fetch();
    await interaction.reply({ embeds: [chiEmbed('info', `🏰 ${g.name}~`, null, [
      { name: '👑 Owner', value: `<@${g.ownerId}>`, inline: true },
      { name: '👥 Members', value: `${g.memberCount}`, inline: true },
      { name: '📅 Created', value: `<t:${Math.floor(g.createdTimestamp/1000)}:R>`, inline: true },
      { name: '💬 Channels', value: `${g.channels.cache.size}`, inline: true },
      { name: '🎭 Roles', value: `${g.roles.cache.size}`, inline: true },
      { name: '😊 Emojis', value: `${g.emojis.cache.size}`, inline: true },
    ])] });
  },
};

module.exports = [userinfo, serverinfo];
