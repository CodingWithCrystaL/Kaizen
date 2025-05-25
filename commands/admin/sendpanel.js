const {
  SlashCommandBuilder, PermissionFlagsBits,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendpanel')
    .setDescription('Send ticket panel with setup')
    .addChannelOption(option =>
      option.setName('category')
        .setDescription('Channel category for tickets')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('support_role')
        .setDescription('Support role')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('everyone_role')
        .setDescription('@everyone role')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('transcript_channel')
        .setDescription('Channel to send transcripts')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('banner')
        .setDescription('Banner image URL (optional)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const categoryId = interaction.options.getChannel('category').id;
    const supportRoleId = interaction.options.getRole('support_role').id;
    const everyoneRoleId = interaction.options.getRole('everyone_role').id;
    const transcriptChannelId = interaction.options.getChannel('transcript_channel').id;
    const banner = interaction.options.getString('banner') || null;

    const embed = new EmbedBuilder()
      .setTitle('🎫 Open a Ticket')
      .setDescription('Click below to open a support or shop ticket.')
      .setColor('#2f3136');

    if (banner) embed.setImage(banner);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`create_ticket_${categoryId}_${supportRoleId}_${everyoneRoleId}_${transcriptChannelId}_${banner || 'null'}`)
        .setLabel('🎟️ Create Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ content: '✅ Panel Sent!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  }
};
