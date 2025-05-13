const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, Collection, ActivityType, REST, Routes } = require('discord.js');
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
client.prefixCommands = new Collection();
const prefix = '.';

// Load commands
const commandFolders = ['moderation', 'utility', 'welcome', 'admin'];
for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(folderPath)) {
    console.warn(`[!] Folder not found: ${folderPath}`);
    continue;
  }

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.data) client.commands.set(command.data.name, command); // for slash
    if (command.name) client.prefixCommands.set(command.name, command); // for prefix
  }
}

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Error running command.', ephemeral: true });
  }
});

// Handle prefix commands
client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();
  const command = client.prefixCommands.get(cmdName);
  if (!command) return;
  try {
    await command.run(client, message, args);
  } catch (err) {
    console.error(err);
    await message.channel.send('❌ Error running command.');
  }
});

// Auto-register slash commands
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commandsArray = client.commands.map(cmd => cmd.data.toJSON());

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commandsArray });
    console.log('✅ Slash commands registered globally.');
  } catch (err) {
    console.error('❌ Failed to register slash commands:', err);
  }

  // Rotating status
  const statuses = [
    () => `👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
    () => `.help | Kaizen`,
    () => `🌐 ${client.guilds.cache.size} servers`
  ];

  let i = 0;
  setInterval(() => {
    const status = statuses[i++ % statuses.length]();
    client.user.setActivity(status, { type: ActivityType.Watching });
  }, 10000);
});

// KeepAlive for Render
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('🌐 KeepAlive server running on port 3000'));

client.login(process.env.DISCORD_TOKEN);
