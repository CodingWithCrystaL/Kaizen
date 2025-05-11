const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('📦 View info about the bot'),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const uptime = moment.duration(interaction.client.uptime).format("D[d] H[h] m[m] s[s]");

    const embed = new EmbedBuilder()
      .setTitle('📦 Bot Information')
      .addFields(
        { name: 'Name', value: interaction.client.user.tag, inline: true },
        { name: 'ID', value: interaction.client.user.id, inline: true },
        { name: 'Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'Memory', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true }
      )
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
