const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('🥾 Kick a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Select a user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kicking')),
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member || !member.kickable) {
      return interaction.reply({ content: '⚠️ I cannot kick this user.', ephemeral: true });
    }

    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setTitle('🥾 Member Kicked')
      .setDescription(`**${user.tag}** has been kicked.\n**Reason:** ${reason}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name} | 🌙Made By Kai` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
