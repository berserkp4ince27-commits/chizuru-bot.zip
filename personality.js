// Chizuru's kawaii personality responses
const personality = {
  // Mod actions
  warned: (user, reason, count) => `🌸 Ara ara~ <@${user}>, that wasn't very nice! You've been warned! (${count}/3 warnings) Reason: *${reason}* Please be good, okay? ✨`,
  muted: (user, duration, reason) => `🔇 Shhhh~ <@${user}> has been put on timeout for ${duration}! Reason: *${reason}* Chizuru hopes you reflect on your actions~ 💕`,
  kicked: (user, reason) => `👢 Kyaa~! <@${user}> has been kicked from the server! Reason: *${reason}* Maybe next time be nicer, okay? 🌸`,
  banned: (user, reason) => `🔨 H-hentai alert! <@${user}> has been banned! Reason: *${reason}* Chizuru will not tolerate such behavior! ✨`,
  jailed: (user, reason) => `🔒 Gotcha~! <@${user}> has been sent to jail! Reason: *${reason}* Stay there and think about what you did! 💢`,
  unjailed: (user) => `🗝️ Chizuru will give <@${user}> another chance~ Please be good this time, okay? 🌸`,
  messageDeleted: (reason) => `🌸 Chizuru deleted a message~ Reason: *${reason}* Let's keep the server clean! ✨`,

  // Raid/Nuke
  raidDetected: () => `🚨 K-kyaa~! A raid is happening! Chizuru is activating lockdown mode! Please stay calm, everyone! 💢`,
  nukeDetected: (user) => `💥 Someone is trying to nuke the server! Chizuru has neutralized <@${user}>! How dare they~! 😤`,

  // Welcome
  welcome: (user, guild) => `🌸 Ara ara~! Welcome to **${guild}**, <@${user}>! Chizuru is so happy you're here! Please read the rules and have fun~ ✨💕`,

  // XP/Level up
  levelUp: (user, level) => `🎉 Sugoi~! <@${user}> just reached **Level ${level}**! Chizuru is so proud of you! Keep chatting~ 🌸✨`,

  // Tickets
  ticketOpened: (user) => `🎫 Chizuru has opened a ticket for <@${user}>~! Please describe your issue and staff will help soon! 💕`,
  ticketClosed: () => `🌸 This ticket has been closed! Thank you for reaching out~ Chizuru hopes everything was resolved! ✨`,

  // Errors
  noPermission: () => `🌸 Ara~ You don't have permission to do that! Only trusted people can use this command~ 💕`,
  error: () => `😅 K-kyaa~! Something went wrong on Chizuru's end! Please try again later~ 🌸`,
};

// Embed colors
const colors = {
  success: 0xff9bc8,  // kawaii pink
  warn: 0xffcc44,
  error: 0xff4466,
  info: 0xb39ddb,    // soft purple
  nuke: 0xff0000,
  jail: 0x795548,
  xp: 0xf48fb1,
};

// Build a standard Chizuru embed
function chiEmbed(type, title, description, fields = []) {
  return {
    color: colors[type] || colors.info,
    author: { name: 'Chizuru ✨', icon_url: 'https://i.imgur.com/wSTFkRM.png' },
    title,
    description,
    fields,
    footer: { text: 'Chizuru Bot 🌸 • Powered by Claude AI' },
    timestamp: new Date().toISOString(),
  };
}

module.exports = { personality, chiEmbed, colors };
