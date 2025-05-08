const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
const folders = fs.readdirSync('./commands');

for (const folder of folders) {
  const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔁 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Commands registered.');
  } catch (error) {
    console.error(error);
  }
})();
