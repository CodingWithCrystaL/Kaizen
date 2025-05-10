const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const warnPath = path.join(__dirname, '../../data/warns.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarn')
    .setDescription('🧽 Clear all warnings of a user')
    .addUserOption(option =>
      option.setName('target').setDescription('User to clear warnings for').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const user = isSlash
      ? interaction.options.getUser('target')
      : interaction.mentions.users.first();

    if (!user) {
      return interaction.reply({ content: '⚠️ Please mention a valid user.', ephemeral: !isSlash });
    }

    const warns = JSON.parse(fs.readFileSync(warnPath));
    const id = interaction.guild.id + user.id;

    if (!warns[id] || warns[id].length === 0) {
      return interaction.reply({ content: `ℹ️ **${user.tag}** has no warnings.`, ephemeral: !isSlash });
    }

    delete warns[id];
    fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('🧽 Warnings Cleared')
      .setDescription(`> All warnings for **${user.tag}** have been cleared.`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
