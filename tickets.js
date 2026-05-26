const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { chiEmbed, personality } = require('../services/personality');

const ticket = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('🎫 Open a support ticket~'),

  async execute(interaction, client) {
    const categoryId = process.env.TICKET_CATEGORY_ID;
    const userId = interaction.user.id;
    const guild = interaction.guild;

    // Check if user already has a ticket
    const existing = [...client.tickets.entries()].find(([, t]) => t.userId === userId);
    if (existing) {
      return interaction.reply({ embeds: [chiEmbed('warn', '⚠️ Ara~!', `You already have a ticket open! <#${existing[0]}>`)], ephemeral: true });
    }

    // Create ticket channel
    const channel = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: categoryId || null,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: ['ViewChannel'] },
        { id: userId, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        { id: guild.members.me, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'] },
      ],
    });

    client.tickets.set(channel.id, { userId, opened: new Date().toISOString() });

    await channel.send({
      embeds: [chiEmbed('info', '🎫 Ticket Opened~!', personality.ticketOpened(userId), [
        { name: 'How to close', value: 'Use `/closeticket` when done~' }
      ])]
    });

    await interaction.reply({ embeds: [chiEmbed('success', '✅ Ticket Created~!', `Your ticket is ready: <#${channel.id}>`)], ephemeral: true });
  },
};

const closeticket = {
  data: new SlashCommandBuilder()
    .setName('closeticket')
    .setDescription('🌸 Close this support ticket~'),

  async execute(interaction, client) {
    const ticketData = client.tickets.get(interaction.channel.id);
    if (!ticketData) {
      return interaction.reply({ embeds: [chiEmbed('error', '❌ Oops~', 'This is not a ticket channel!')], ephemeral: true });
    }

    const isMod = interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers);
    const isOwner = ticketData.userId === interaction.user.id;

    if (!isMod && !isOwner) {
      return interaction.reply({ embeds: [chiEmbed('error', '❌ Ara~!', 'Only the ticket owner or moderators can close this!')], ephemeral: true });
    }

    await interaction.reply({ embeds: [chiEmbed('info', '🌸 Closing Ticket~', personality.ticketClosed())] });
    client.tickets.delete(interaction.channel.id);
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  },
};

module.exports = [ticket, closeticket];
