const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const express = require('express');

// Create bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Load all commands
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

// Deploy slash commands globally
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
    console.log('🔁 Deploying global slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ Commands deployed successfully.');
  } catch (error) {
    console.error('❌ Command deployment failed:', error);
  }
};

// Interaction handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ There was an error executing that command.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ There was an error executing that command.', ephemeral: true });
    }
  }
});

// Bot ready event
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const statuses = [
    () => `👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} Users`,
    () => `🏠 ${client.guilds.cache.size} Servers`,
    () => `💬 Type /help to begin`
  ];

  let i = 0;
  setInterval(() => {
    const status = statuses[i % statuses.length]();
    client.user.setActivity(status, { type: 3 }); // 3 = WATCHING
    i++;
  }, 4000);
});

// Keep-alive server
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('✅ Keep-alive server running on port 3000'));

// Deploy commands then login
deployCommands().then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
