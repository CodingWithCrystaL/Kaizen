const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('🔊 Remove timeout from a user')
    .addUserOption(option =>
      option.setName('target').setDescription('User to unmute').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for unmute'))
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
      return interaction.reply({ content: '⚠️ Please mention a valid user.', ephemeral: !isSlash });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member || !member.moderatable) {
      return interaction.reply({ content: '❌ I cannot unmute this user.', ephemeral: !isSlash });
    }

    await member.timeout(null, reason);

    const embed = new EmbedBuilder()
      .setTitle('🔊 Member Unmuted')
      .setDescription(`> **${user.tag}** has been unmuted.\n> **Reason:** ${reason}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
