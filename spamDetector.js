const WINDOW = 5000;
const MSG_LIMIT = 5;
const DUP_LIMIT = 3;

function checkSpam(client, userId, content) {
  const now = Date.now();
  if (!client.spamTracker.has(userId)) client.spamTracker.set(userId, []);
  const history = client.spamTracker.get(userId).filter(e => now - e.time < WINDOW);
  history.push({ time: now, content });
  client.spamTracker.set(userId, history);

  if (history.length >= MSG_LIMIT)
    return { isSpam: true, reason: `Sending messages too fast (${history.length} in 5s)` };

  if (history.filter(e => e.content === content).length >= DUP_LIMIT)
    return { isSpam: true, reason: 'Sending repeated/duplicate messages' };

  return { isSpam: false, reason: null };
}

module.exports = { checkSpam };
