const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { chiEmbed, personality } = require('../services/personality');
const { addWarning, getWarnings, clearWarnings, getLogChannel } = require('../services/modActions');

const warn = {
  data: new SlashCommandBuilder()
    .setName('warn').setDescription('⚠️ Warn a user~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)),
  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');
    if (!target) return interaction.reply({ embeds: [chiEmbed('error', '❌', 'User not found!')], ephemeral: true });
    const count = addWarning(client, target.id, reason);
    await interaction.reply({ embeds: [chiEmbed('warn', '⚠️ Warning Issued~!', personality.warned(target.id, reason, count))] });
  },
};

const warnings = {
  data: new SlashCommandBuilder()
    .setName('warnings').setDescription('📋 Check a user\'s warnings~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const warns = getWarnings(client, target.id);
    if (!warns.length) return interaction.reply({ embeds: [chiEmbed('success', '✅ Clean~!', `${target.username} has no warnings! Good job~ 🌸`)], ephemeral: true });
    const desc = warns.map((w, i) => `**${i+1}.** ${w.reason}`).join('\n');
    await interaction.reply({ embeds: [chiEmbed('warn', `⚠️ Warnings — ${target.username}`, desc)], ephemeral: true });
  },
};

const clearwarnings = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings').setDescription('🧹 Clear all warnings for a user~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    clearWarnings(client, target.id);
    await interaction.reply({ embeds: [chiEmbed('success', '✅ Cleared~!', `All warnings for **${target.username}** have been cleared! 🌸`)], ephemeral: true });
  },
};

const kick = {
  data: new SlashCommandBuilder()
    .setName('kick').setDescription('👢 Kick a user~')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target?.kickable) return interaction.reply({ embeds: [chiEmbed('error', '❌', "Chizuru can't kick this user!")], ephemeral: true });
    await target.kick(reason);
    await interaction.reply({ embeds: [chiEmbed('warn', '👢 Kicked~!', personality.kicked(target.id, reason))] });
  },
};

const ban = {
  data: new SlashCommandBuilder()
    .setName('ban').setDescription('🔨 Ban a user~')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target?.bannable) return interaction.reply({ embeds: [chiEmbed('error', '❌', "Chizuru can't ban this user!")], ephemeral: true });
    await target.ban({ reason, deleteMessageSeconds: 86400 });
    await interaction.reply({ embeds: [chiEmbed('error', '🔨 Banned~!', personality.banned(target.id, reason))] });
  },
};

const purge = {
  data: new SlashCommandBuilder()
    .setName('purge').setDescription('🧹 Bulk delete messages~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName('amount').setDescription('Amount (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true).catch(() => null);
    await interaction.editReply({ embeds: [chiEmbed('success', '🧹 Cleaned~!', `Chizuru deleted **${deleted?.size ?? 0}** messages! ✨`)] });
  },
};

const mute = {
  data: new SlashCommandBuilder()
    .setName('mute').setDescription('🔇 Timeout a user~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(10080))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target) return interaction.reply({ embeds: [chiEmbed('error', '❌', 'User not found!')], ephemeral: true });
    await target.timeout(minutes * 60 * 1000, reason);
    await interaction.reply({ embeds: [chiEmbed('warn', '🔇 Muted~!', personality.muted(target.id, `${minutes} minutes`, reason))] });
  },
};

const unmute = {
  data: new SlashCommandBuilder()
    .setName('unmute').setDescription('🔊 Remove timeout from a user~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ embeds: [chiEmbed('error', '❌', 'User not found!')], ephemeral: true });
    await target.timeout(null);
    await interaction.reply({ embeds: [chiEmbed('success', '🔊 Unmuted~!', `<@${target.id}> has been unmuted! Be good this time~ 🌸`)] });
  },
};

const lockdown = {
  data: new SlashCommandBuilder()
    .setName('lockdown').setDescription('🔒 Lock or unlock this channel~')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(o => o.setName('action').setDescription('Lock or unlock').setRequired(true).addChoices(
      { name: 'Lock', value: 'lock' },
      { name: 'Unlock', value: 'unlock' }
    )),
  async execute(interaction) {
    const action = interaction.options.getString('action');
    const locked = action === 'lock';
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: locked ? false : null });
    await interaction.reply({ embeds: [chiEmbed(locked ? 'warn' : 'success',
      locked ? '🔒 Channel Locked~!' : '🔓 Channel Unlocked~!',
      locked ? 'Chizuru has locked this channel! No one can send messages here~ 💢' : 'Chizuru has unlocked this channel! You can chat again~ 🌸'
    )] });
  },
};

module.exports = [warn, warnings, clearwarnings, kick, ban, purge, mute, unmute, lockdown];
