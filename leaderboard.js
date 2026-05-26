const { SlashCommandBuilder } = require('discord.js');
const { chiEmbed } = require('../services/personality');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 See the top chatters~!'),

  async execute(interaction, client) {
    const sorted = [...client.xpData.entries()]
      .sort((a, b) => b[1].xp - a[1].xp)
      .slice(0, 10);

    if (!sorted.length) {
      return interaction.reply({ embeds: [chiEmbed('info', '🏆 Leaderboard~!', 'Nobody has XP yet! Start chatting~ 🌸')], ephemeral: true });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const desc = sorted.map(([id, d], i) =>
      `${medals[i] || `**${i+1}.**`} <@${id}> — Level **${d.level}** | **${d.xp}** XP`
    ).join('\n');

    await interaction.reply({ embeds: [chiEmbed('xp', '🏆 Top Chatters~!', desc)] });
  },
};
