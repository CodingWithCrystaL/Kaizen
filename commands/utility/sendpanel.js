const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendpanel')
    .setDescription('Send the ticket panel with buttons to create tickets.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎫 Ticket Panel')
      .setDescription('Click the button below to create a ticket.')
      .setColor(0x00AE86);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ content: '✅ Ticket panel sent.', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  }
};
