const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('📊 Show total members in the server'),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle('📊 Total Members')
      .setDescription(`> This server has **${guild.memberCount}** members.`)
      .setColor('#ffffff')
      .setFooter({ text: `${guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
