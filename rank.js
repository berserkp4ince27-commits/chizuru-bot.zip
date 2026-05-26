const { SlashCommandBuilder } = require('discord.js');
const { chiEmbed } = require('../services/personality');
const { getRank, xpForLevel } = require('../services/xpSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('⭐ Check your XP rank~!')
    .addUserOption(o => o.setName('user').setDescription('User to check (optional)')),

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const { xp, level, needed, rank } = getRank(client, target.id);
    const progress = Math.floor((xp / needed) * 20);
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);

    await interaction.reply({
      embeds: [chiEmbed('xp', `⭐ ${target.username}'s Rank~!`, null, [
        { name: '🏅 Rank', value: `#${rank}`, inline: true },
        { name: '⭐ Level', value: `${level}`, inline: true },
        { name: '✨ XP', value: `${xp} / ${needed}`, inline: true },
        { name: '📊 Progress', value: `\`${bar}\` ${Math.floor((xp/needed)*100)}%` },
      ])]
    });
  },
};
