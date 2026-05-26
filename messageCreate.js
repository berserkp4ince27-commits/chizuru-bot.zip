const { analyzeMessage } = require('../services/aiModerator');
const { checkSpam } = require('../services/spamDetector');
const { takeAction, getLogChannel } = require('../services/modActions');
const { handleXP } = require('../services/xpSystem');
const { chiEmbed, personality } = require('../services/personality');

const contextCache = new Map();
const CONTEXT_SIZE = 5;

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const channelId = message.channel.id;

    // Skip jailed users from XP but still moderate them
    if (!client.jailedUsers.has(userId)) {
      await handleXP(message, client);
    }

    // --- SPAM CHECK ---
    const spam = checkSpam(client, userId, message.content);
    if (spam.isSpam) {
      try { await message.delete(); } catch (_) {}
      try { await message.member.timeout(5 * 60 * 1000, spam.reason); } catch (_) {}
      const log = getLogChannel(message.guild);
      if (log) await log.send({ embeds: [chiEmbed('warn', '🚫 Spam Detected~!',
        `<@${userId}> was spamming and got a 5 min timeout!\n**Reason:** ${spam.reason}`)] }).catch(() => {});
      return;
    }

    // --- AI MODERATION ---
    if (message.content.length < 3) return;

    if (!contextCache.has(channelId)) contextCache.set(channelId, []);
    const context = contextCache.get(channelId).slice(-CONTEXT_SIZE);

    const result = await analyzeMessage(message.content, context);
    if (result.flagged) {
      await takeAction(message, result.severity, result.reason, client);
      return;
    }

    // Update context
    context.push({ author: message.author.username, content: message.content });
    if (context.length > CONTEXT_SIZE) context.shift();
    contextCache.set(channelId, context);
  },
};
