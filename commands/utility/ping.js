const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🛰️ Shows the bot latency'),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const ping = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🛰️ Bot Ping')
      .setDescription(`> Latency: \`${ping}ms\``)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
