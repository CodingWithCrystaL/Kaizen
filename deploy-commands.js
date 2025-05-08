const { REST, Routes } = require('discord.js');
const fs = require('fs');

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
    console.log('🔁 Registering global slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Global commands registered successfully.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();
