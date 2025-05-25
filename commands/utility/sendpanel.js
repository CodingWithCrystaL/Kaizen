const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendpanel')
    .setDescription('Send the ticket panel with an Edit Panel button'),

  async execute(interaction, client) {
    const panelData = client.panelData || {
      title: "Shop & Support Tickets",
      description: "To create a ticket, click the button below!",
      image: "https://example.com/default-banner.png"
    };

    const embed = new EmbedBuilder()
      .setTitle(panelData.title)
      .setDescription(panelData.description)
      .setColor("#ffffff")
      .setImage(panelData.image);

    const panelRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("create-ticket").setLabel("🎟️ Create Ticket").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("edit-panel").setLabel("🛠️ Edit Panel").setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ content: "✅ Ticket panel sent.", ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [panelRow] });
  }
};
