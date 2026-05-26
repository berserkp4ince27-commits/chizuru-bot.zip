module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`🌸 Chizuru is online as ${client.user.tag}!`);
    const activities = [
      { name: '🌸 Protecting the server~', type: 3 },
      { name: '✨ Powered by Claude AI', type: 3 },
      { name: '💕 /help for commands~', type: 3 },
    ];
    let i = 0;
    client.user.setActivity(activities[0].name, { type: activities[0].type });
    setInterval(() => {
      i = (i + 1) % activities.length;
      client.user.setActivity(activities[i].name, { type: activities[i].type });
    }, 15000);
  },
};
