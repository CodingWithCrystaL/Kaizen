const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('🔒 Lock the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    });

    const embed = new EmbedBuilder()
      .setTitle('🔒 Channel Locked')
      .setDescription('This channel is now locked.')
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name} | 🌙Made By Kai` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
