const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const express = require('express');

const prefix = "."; // <<< your prefix

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Load commands
const folders = fs.readdirSync('./commands');
for (const folder of folders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARN] Command ${file} missing "data" or "execute"`);
    }
  }
}

// Slash command deploy
const deployCommands = async () => {
  const commands = [];
  for (const folder of folders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('🔁 Deploying slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ Slash commands deployed.');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
};

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: '❌ Error running command.', ephemeral: true });
  }
});

// Handle prefix commands
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  const command = client.commands.get(cmdName);
  if (!command) return;

  try {
    await command.execute({
      ...message,
      reply: (msg) => message.channel.send(msg),
      options: {
        getUser: () => message.mentions.users.first(),
        getString: () => args.slice(1).join(" ")
      },
      user: message.author,
      member: message.member,
      guild: message.guild
    });
  } catch (err) {
    console.error(err);
    message.channel.send('❌ Error running command.');
  }
});

// Bot ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const statuses = [
    () => `👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} Users`,
    () => `🏠 ${client.guilds.cache.size} Servers`,
    () => `💬 Type /help or .help`
  ];

  let i = 0;
  setInterval(() => {
    const status = statuses[i % statuses.length]();
    client.user.setActivity(status, { type: 3 });
    i++;
  }, 4000);
});

// Keep-alive web server for Render
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('✅ Keep-alive server running on port 3000'));

// Deploy then login
deployCommands().then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
