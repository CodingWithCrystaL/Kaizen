const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/welcome.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('togglewelcome')
    .setDescription('🔁 Enable or disable the welcome system')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('on or off')
        .setRequired(true)
        .addChoices(
          { name: 'on', value: 'on' },
          { name: 'off', value: 'off' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const mode = isSlash
      ? interaction.options.getString('mode')
      : interaction.content.split(' ')[1]?.toLowerCase();

    if (!['on', 'off'].includes(mode)) {
      return interaction.reply({ content: '⚠️ Please specify `on` or `off`.', ephemeral: !isSlash });
    }

    const db = JSON.parse(fs.readFileSync(dbPath));
    db[interaction.guild.id] = db[interaction.guild.id] || {};
    db[interaction.guild.id].enabled = mode === 'on';
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    const embed = new EmbedBuilder()
      .setTitle(`🔁 Welcome System ${mode === 'on' ? 'Enabled' : 'Disabled'}`)
      .setDescription(`> Welcome messages are now **${mode.toUpperCase()}**.`)
      .setColor('#ffffff')
      .setFooter({ text: interaction.guild.name })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
