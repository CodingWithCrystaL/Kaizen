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
    .setName('warn')
    .setDescription('⚠️ Warn a member')
    .addUserOption(option =>
      option.setName('target').setDescription('User to warn').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for warning'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const user = isSlash
      ? interaction.options.getUser('target')
      : interaction.mentions.users.first();

    const reason = isSlash
      ? interaction.options.getString('reason') || 'No reason provided'
      : interaction.content.split(' ').slice(2).join(' ') || 'No reason provided';

    if (!user) {
      return interaction.reply({ content: '⚠️ Please mention a user.', ephemeral: !isSlash });
    }

    const warns = JSON.parse(fs.readFileSync(warnPath));
    const id = interaction.guild.id + user.id;

    if (!warns[id]) warns[id] = [];
    warns[id].push({ moderator: interaction.user.tag, reason, date: new Date().toISOString() });

    fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Warning Issued')
      .setDescription(`> **${user.tag}** has been warned.\n> **Reason:** ${reason}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
