const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms'); // Required for time conversion like 10m, 1h

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('🔇 Temporarily mute a member (timeout)')
    .addUserOption(option =>
      option.setName('target').setDescription('User to mute').setRequired(true))
    .addStringOption(option =>
      option.setName('duration').setDescription('Duration (e.g. 10m, 1h)').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for mute'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const user = isSlash
      ? interaction.options.getUser('target')
      : interaction.mentions.users.first();

    const durationInput = isSlash
      ? interaction.options.getString('duration')
      : interaction.content.split(' ')[2];

    const reason = isSlash
      ? interaction.options.getString('reason') || 'No reason provided'
      : interaction.content.split(' ').slice(3).join(' ') || 'No reason provided';

    if (!user) {
      return interaction.reply({ content: '⚠️ Please mention a user to mute.', ephemeral: !isSlash });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member || !member.moderatable) {
      return interaction.reply({ content: '❌ I cannot mute this user.', ephemeral: !isSlash });
    }

    const durationMs = ms(durationInput);
    if (!durationMs || durationMs > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: '⚠️ Provide a valid duration (max 28 days).', ephemeral: !isSlash });
    }

    await member.timeout(durationMs, reason);

    const embed = new EmbedBuilder()
      .setTitle('🔇 Member Muted')
      .setDescription(`> **${user.tag}** has been muted.\n> **Duration:** ${durationInput}\n> **Reason:** ${reason}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
