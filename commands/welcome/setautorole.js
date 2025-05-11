const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/welcome.json');

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setautorole')
    .setDescription('🎓 Set a role to auto-assign on member join')
    .addRoleOption(option =>
      option.setName('role').setDescription('Role to give on join').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const role = isSlash
      ? interaction.options.getRole('role')
      : interaction.mentions.roles.first();

    if (!role) {
      return interaction.reply({ content: '⚠️ Please mention a valid role.', ephemeral: !isSlash });
    }

    const db = JSON.parse(fs.readFileSync(dbPath));
    const guildId = interaction.guild.id;

    db[guildId] = db[guildId] || {};
    db[guildId].autorole = role.id;

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('🎓 Auto Role Set')
      .setDescription(`> New members will receive the **${role.name}** role.`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
