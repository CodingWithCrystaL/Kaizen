const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const warnPath = path.join(__dirname, '../../data/warns.json');

if (!fs.existsSync(warnPath)) {
  fs.mkdirSync(path.dirname(warnPath), { recursive: true });
  fs.writeFileSync(warnPath, JSON.stringify({}));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarn')
    .setDescription('🧽 Clear all warnings of a user')
    .addUserOption(option =>
      option.setName('target').setDescription('User to clear').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const user = isSlash
      ? interaction.options.getUser('target')
      : interaction.mentions.users.first();

    if (!user) {
      return interaction.reply({ content: '⚠️ Mention a user.', ephemeral: !isSlash });
    }

    const warns = JSON.parse(fs.readFileSync(warnPath));
    const id = interaction.guild.id + user.id;

    if (!warns[id]) {
      return interaction.reply({ content: `ℹ️ No warnings for ${user.tag}.`, ephemeral: !isSlash });
    }

    delete warns[id];
    fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('🧽 Warnings Cleared')
      .setDescription(`> All warnings for **${user.tag}** are cleared.`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
