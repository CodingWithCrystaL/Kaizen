const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 Ban a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Select a user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for banning')),
    // Only members with Ban Members permission
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: '❌ Member not found.', ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: '⚠️ I cannot ban this user.', ephemeral: true });
    }

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle('🔨 Member Banned')
      .setDescription(`**${user.tag}** has been banned.\n**Reason:** ${reason}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name} | 🌙Made By Kai` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
