const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ActivityType,
  REST,
  Routes
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.prefix = '.';

// Load commands
const foldersPath = path.join(__dirname, 'commands');
for (const folder of fs.readdirSync(foldersPath)) {
  const commandsPath = path.join(foldersPath, folder);
  for (const file of fs.readdirSync(commandsPath)) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

// Slash handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
  }
});

// Prefix handler (fixed)
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(client.prefix)) return;

  const args = message.content.slice(client.prefix.length).trim().split(/ +/);
  const name = args.shift().toLowerCase();
  const command = client.commands.get(name);
  if (!command) return;

  try {
    const fakeInteraction = {
      ...message,
      commandName: name,
      isChatInputCommand: () => false,
      options: {
        getString: (i = 0) => args.slice(i).join(' '),
        getInteger: (i = 0) => parseInt(args[i]),
        getUser: () => message.mentions.users.first(),
        getRole: () => message.mentions.roles.first()
      },
      user: message.author,
      reply: (payload) => message.channel.send(payload),
      guild: message.guild,
      member: message.member,
      content: message.content
    };

    await command.execute(fakeInteraction);
  } catch (error) {
    console.error(error);
    message.reply('❌ Error executing command.');
  }
});

// Bot Ready
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Register slash commands
  try {
    const slashData = client.commands.map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: slashData });
    console.log('✅ Slash commands registered.');
  } catch (err) {
    console.error('❌ Slash registration failed:', err);
  }

  // Status rotation
  const statusArray = [
    () => `👤 ${client.users.cache.size} users`,
    () => `🌐 ${client.guilds.cache.size} servers`,
    () => `/help or .help to begin`
  ];
  let index = 0;
  setInterval(() => {
    client.user.setActivity(statusArray[index++ % statusArray.length](), { type: ActivityType.Watching });
  }, 4000);
});

// KeepAlive for Render
const app = express();
app.get('/', (req, res) => res.send('Kaizen bot is alive!'));
app.listen(3000, () => console.log('✅ KeepAlive server live on port 3000'));

client.login(process.env.DISCORD_TOKEN);
