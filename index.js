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

const prefix = '.';
client.commands = new Collection();       // for slash
client.prefixCommands = new Collection(); // for prefix

// Load Commands (prefix + slash)
const commandFolders = ['moderation', 'utility', 'welcome', 'admin'];
for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(folderPath)) {
    console.warn(`[!] Folder not found: ${folderPath}`);
    continue;
  }

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data) client.commands.set(command.data.name, command);        // Slash
    if (command.name && command.run) client.prefixCommands.set(command.name, command); // Prefix
  }
}

// Slash Commands Handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`❌ Slash Error: ${interaction.commandName}`, err);
    await interaction.reply({ content: '❌ Command failed.', ephemeral: true });
  }
});

// Prefix Commands Handler
client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  console.log(`[PREFIX] ${message.content}`);

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();
  const command = client.prefixCommands.get(cmdName);

  if (!command) return console.log(`❌ Unknown prefix command: ${cmdName}`);

  try {
    await command.run(client, message, args);
  } catch (err) {
    console.error(`❌ Prefix Error: ${cmdName}`, err);
    await message.channel.send('❌ Something went wrong.');
  }
});

// Auto Register Slash Commands
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commandsArray = client.commands.map(cmd => cmd.data.toJSON());

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commandsArray });
    console.log('✅ Slash commands registered.');
  } catch (err) {
    console.error('❌ Slash registration failed:', err);
  }

  // Rotating Bot Status
  const statuses = [
    () => `👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
    () => `.help | Kaizen`,
    () => `🌐 ${client.guilds.cache.size} servers`
  ];
  let i = 0;
  setInterval(() => {
    client.user.setActivity(statuses[i++ % statuses.length](), { type: ActivityType.Watching });
  }, 10000);
});

// KeepAlive for Render
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('🌐 KeepAlive server running on port 3000'));

client.login(process.env.DISCORD_TOKEN);
