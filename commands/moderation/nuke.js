const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('💣 Nuke (clone & delete) the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const channel = interaction.channel;

    const clone = await channel.clone({ reason: 'Channel nuked' });
    await channel.delete();

    const embed = new EmbedBuilder()
      .setTitle('💣 Channel Nuked')
      .setDescription(`> This channel has been nuked and recreated.`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    await clone.send({ embeds: [embed] });
  }
};
