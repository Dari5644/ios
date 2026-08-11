const db = require('../utils/db');

module.exports = {
  name: 'guildMemberAdd',
  execute(member) {
    db.prepare('INSERT INTO activity_log (type, message) VALUES (?, ?)')
      .run('join', `${member.user.username} انضم إلى سيرفر الديسكورد 🎮`);
  }
};
