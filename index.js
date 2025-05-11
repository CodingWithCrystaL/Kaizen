const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
client.prefix = '.';

// Load commands
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./src/commands/${folder}`)
    .filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

// Slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await interaction.deferReply();
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: '❌ Something went wrong.' });
    } else {
      await interaction.reply({ content: '❌ Something went wrong.', ephemeral: true });
    }
  }
});

// Prefix commands
client.on('messageCreate', async message => {
  if (!message.content.startsWith(client.prefix) || message.author.bot) return;

  const args = message.content.slice(client.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.run(client, message, args);
  } catch (err) {
    console.error(err);
    message.reply('❌ There was an error executing that command.');
  }
});

// Rotating Status
client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const activities = [
    () => `👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} Users`,
    () => `🔧 .help to begin`,
    () => `🌐 Serving ${client.guilds.cache.size} servers`
  ];

  let index = 0;
  setInterval(() => {
    const status = activities[index++ % activities.length]();
    client.user.setActivity(status, { type: ActivityType.Watching });
  }, 4000);
});

// KeepAlive for Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('🌐 KeepAlive server running'));

client.login(process.env.DISCORD_TOKEN);
