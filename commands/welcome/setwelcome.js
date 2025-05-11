const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/welcome.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('🛠️ Set the welcome channel')
    .addChannelOption(option =>
      option.setName('channel').setDescription('Channel to send welcome messages').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const channel = isSlash
      ? interaction.options.getChannel('channel')
      : interaction.mentions.channels.first();

    if (!channel) {
      return interaction.reply({ content: '⚠️ Please mention a valid channel.', ephemeral: !isSlash });
    }

    const db = JSON.parse(fs.readFileSync(dbPath));
    db[interaction.guild.id] = db[interaction.guild.id] || {};
    db[interaction.guild.id].channel = channel.id;

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('🛠️ Welcome Channel Set')
      .setDescription(`> Welcome messages will now be sent in <#${channel.id}>.`)
      .setColor('#ffffff')
      .setFooter({ text: interaction.guild.name })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
