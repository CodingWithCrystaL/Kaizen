const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('🧹 Delete a number of messages from the channel')
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Number of messages to delete').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '⚠️ Enter a number between 1 and 100.', ephemeral: true });
    }

    const { size } = await interaction.channel.bulkDelete(amount, true);
    interaction.reply({ content: `✅ Deleted \`${size}\` messages.`, ephemeral: true });
  }
};
