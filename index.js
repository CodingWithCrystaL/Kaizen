const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();
client.prefixCommands = new Collection();
const prefix = '.';

// Slash & prefix command loader
const commandFolders = ['moderation', 'utility', 'welcome'];
for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(folderPath)) {
    console.warn(`[!] Folder not found: ${folderPath}`);
    continue;
  }

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.data) client.commands.set(command.data.name, command);
    if (command.name) client.prefixCommands.set(command.name, command);
  }
}

// Slash command interaction
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

// Prefix command handler
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

// Rotating bot status
const statuses = [
  () => `Watching over ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
  () => `.help | Kaizen`,
  () => `Serving ${client.guilds.cache.size} servers`,
];
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  let i = 0;
  setInterval(() => {
    const status = statuses[i % statuses.length]();
    client.user.setActivity(status, { type: ActivityType.Watching });
    i++;
  }, 10000);
});

client.login(process.env.DISCORD_TOKEN);
