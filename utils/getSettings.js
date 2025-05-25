const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../data/serverSettings.json');

module.exports = function getSettings(guildId) {
  if (!fs.existsSync(dbPath)) return null;
  const data = JSON.parse(fs.readFileSync(dbPath));
  return data[guildId] || null;
};
