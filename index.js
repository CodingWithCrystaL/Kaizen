const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
require('./handlers/commandHandler')(client);

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Rotating activity status
  const statuses = [
    () => `👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} Users`,
    () => `🏠 ${client.guilds.cache.size} Servers`,
    () => `💬 Type /help to begin`
  ];

  let i = 0;
  setInterval(() => {
    const status = statuses[i % statuses.length]();
    client.user.setActivity(status, { type: 3 }); // 3 = Watching
    i++;
  }, 4000); // Rotate every 15 sec
});

client.login(process.env.DISCORD_TOKEN);
