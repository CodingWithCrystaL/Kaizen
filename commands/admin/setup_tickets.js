const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/serverSettings.json');

function saveSettings(guildId, settings) {
  let allSettings = {};
  if (fs.existsSync(dbPath)) {
    allSettings = JSON.parse(fs.readFileSync(dbPath));
  }
  allSettings[guildId] = settings;
  fs.writeFileSync(dbPath, JSON.stringify(allSettings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup_tickets')
    .setDescription('Configure ticket system settings for this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('support_category')
        .setDescription('Category channel for support tickets')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory))
    .addChannelOption(option =>
      option.setName('shop_category')
        .setDescription('Category channel for shop tickets')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory))
    .addRoleOption(option =>
      option.setName('support_role')
        .setDescription('Support role to mention in tickets')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('log_channel')
        .setDescription('Channel where transcripts will be sent')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    const supportCategory = interaction.options.getChannel('support_category');
    const shopCategory = interaction.options.getChannel('shop_category');
    const supportRole = interaction.options.getRole('support_role');
    const logChannel = interaction.options.getChannel('log_channel');

    const settings = {
      supportCategory: supportCategory.id,
      shopCategory: shopCategory.id,
      supportRole: supportRole.id,
      logChannel: logChannel.id
    };

    saveSettings(guildId, settings);

    await interaction.reply({
      content: '✅ Ticket system settings have been saved for this server.',
      ephemeral: true
    });
  }
};
