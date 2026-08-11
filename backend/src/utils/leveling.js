const User = require('../models/User');
const Activity = require('../models/Activity');

function xpRequiredForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function calculateLevelFromXp(totalXp) {
  let level = 1;
  while (totalXp >= xpRequiredForLevel(level + 1)) {
    level++;
  }
  return level;
}

const XP_RULES = {
  message: 5,
  challenge_join: 25,
  challenge_win: 60,
  daily_activity: 10
};

function grantXp(userId, eventType, io = null) {
  const amount = XP_RULES[eventType] || 0;
  if (!amount) return null;

  const before = User.findById(userId);
  const updated = User.addXp(userId, amount);
  const newLevel = calculateLevelFromXp(updated.xp);

  if (newLevel > before.level) {
    User.setLevel(userId, newLevel);
    const activity = Activity.log({
      userId,
      type: 'level_up',
      message: `${before.nickname || before.username} ترقّى إلى المستوى ${newLevel} 🎖️`
    });
    if (io) io.emit('activity:new', activity);
  }

  return { ...updated, level: newLevel };
}

module.exports = { grantXp, calculateLevelFromXp, xpRequiredForLevel, XP_RULES };
