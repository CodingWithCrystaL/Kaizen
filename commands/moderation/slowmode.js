const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('🕑 Set slowmode for the current channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Time between messages (in seconds)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;

    const time = isSlash
      ? interaction.options.getInteger('seconds')
      : parseInt(interaction.content.split(' ')[1]);

    if (isNaN(time) || time < 0 || time > 21600) {
      return interaction.reply({ content: '⚠️ Provide a valid number (0–21600 seconds).', ephemeral: !isSlash });
    }

    await interaction.channel.setRateLimitPerUser(time);

    const embed = new EmbedBuilder()
      .setTitle('🕑 Slowmode Updated')
      .setDescription(`> Slowmode is now set to \`${time}\` seconds.`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
