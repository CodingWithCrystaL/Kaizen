const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(opt => opt.setName('target').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member || !member.bannable) {
      return interaction.reply({ content: '❌ I cannot ban this user.', ephemeral: true });
    }

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle('🔨 Member Banned')
      .setDescription(`**${user.tag}** was banned.\n**Reason:** ${reason}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name} | 🌙Made By Kai` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
