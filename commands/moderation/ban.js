const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 Ban a member from the server')
    .addUserOption(option =>
      option.setName('target').setDescription('User to ban').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

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
    if (!member || !member.bannable) {
      return interaction.reply({ content: '❌ I cannot ban this user.', ephemeral: !isSlash });
    }

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle('🔨 User Banned')
      .setDescription(`> **${user.tag}** has been banned.\n> **Reason:** ${reason}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
