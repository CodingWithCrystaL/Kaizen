const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('🧹 Delete messages in bulk')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1–100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const amount = isSlash
      ? interaction.options.getInteger('amount')
      : parseInt(interaction.content.split(' ')[1]);

    if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
      return interaction.reply({
        content: '⚠️ Please provide a valid number between 1 and 100.',
        ephemeral: !isSlash
      });
    }

    const { size } = await interaction.channel.bulkDelete(amount, true);

    const embed = new EmbedBuilder()
      .setTitle('🧹 Messages Deleted')
      .setDescription(`> Successfully deleted \`${size}\` messages.`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
