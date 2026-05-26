const XP_PER_MESSAGE = 15;
const XP_COOLDOWN = 60000; // 1 minute cooldown per user
const xpCooldowns = new Map();

function xpForLevel(level) {
  return 100 * level * level; // Level 1=100, 2=400, 3=900...
}

async function handleXP(message, client) {
  if (message.author.bot) return;
  const userId = message.author.id;
  const now = Date.now();

  // Cooldown check
  if (xpCooldowns.has(userId) && now - xpCooldowns.get(userId) < XP_COOLDOWN) return;
  xpCooldowns.set(userId, now);

  // Get or init user data
  if (!client.xpData.has(userId)) client.xpData.set(userId, { xp: 0, level: 0 });
  const data = client.xpData.get(userId);

  data.xp += XP_PER_MESSAGE + Math.floor(Math.random() * 10); // 15-25 XP

  // Check level up
  const nextLevel = data.level + 1;
  if (data.xp >= xpForLevel(nextLevel)) {
    data.level = nextLevel;
    const { chiEmbed, personality } = require('./personality');
    await message.channel.send({
      embeds: [chiEmbed('xp', '🎉 Level Up~!', personality.levelUp(userId, nextLevel))]
    }).catch(() => {});
  }

  client.xpData.set(userId, data);
}

function getRank(client, userId) {
  const data = client.xpData.get(userId) || { xp: 0, level: 0 };
  const needed = xpForLevel(data.level + 1);
  const all = [...client.xpData.entries()].sort((a, b) => b[1].xp - a[1].xp);
  const rank = all.findIndex(([id]) => id === userId) + 1;
  return { ...data, needed, rank };
}

module.exports = { handleXP, getRank, xpForLevel };
