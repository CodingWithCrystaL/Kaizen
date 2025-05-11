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
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.prefix = '.';

// Load all commands
const foldersPath = path.join(__dirname, 'commands');
for (const folder of fs.readdirSync(foldersPath)) {
  const commandsPath = path.join(foldersPath, folder);
  for (const file of fs.readdirSync(commandsPath)) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
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
    interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
  }
});

// Handle prefix commands
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
        getRole: () => message.mentions.roles.first(),
        getChannel: () => message.mentions.channels.first()
      },
      user: message.author,
      reply: payload => message.channel.send(payload),
      guild: message.guild,
      member: message.member,
      content: message.content
    };

    await command.execute(fakeInteraction);
  } catch (err) {
    console.error(err);
    message.reply('❌ Error executing command.');
  }
});

// Load event handlers
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath)) {
  const event = require(path.join(eventsPath, file));
  if (event.name && typeof event.execute === 'function') {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Bot ready
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

  // Accurate status rotation
  const statuses = [
    () => `👤 ${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)} members`,
    () => `🌐 ${client.guilds.cache.size} servers`,
    () => `/help or .help to begin`
  ];

  let index = 0;
  setInterval(() => {
    const status = statuses[index++ % statuses.length]();
    client.user.setActivity(status, { type: ActivityType.Watching });
  }, 4000);
});

client.login(process.env.DISCORD_TOKEN);
