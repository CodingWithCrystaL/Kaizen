const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('📦 View information about the bot'),

  async execute(interaction) {
    const uptime = moment.duration(interaction.client.uptime).format("D[d] H[h] m[m] s[s]");
    const embed = new EmbedBuilder()
      .setTitle('📦 Bot Info')
      .addFields(
        { name: 'Name', value: interaction.client.user.tag, inline: true },
        { name: 'ID', value: interaction.client.user.id, inline: true },
        { name: 'Uptime', value: uptime, inline: true },
        { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${interaction.client.users.cache.size}`, inline: true },
        { name: 'Ping', value: `${interaction.client.ws.ping}ms`, inline: true }
      )
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
