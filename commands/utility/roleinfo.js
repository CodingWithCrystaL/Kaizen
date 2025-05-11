const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('🎭 View information about a role')
    .addRoleOption(option =>
      option.setName('role').setDescription('Select a role').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const role = isSlash
      ? interaction.options.getRole('role')
      : interaction.mentions.roles.first();

    if (!role) {
      return interaction.reply({ content: '⚠️ Please mention a valid role.', ephemeral: !isSlash });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Role Info — ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor || 'None', inline: true },
        { name: 'Members', value: `${role.members.size}`, inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Permissions', value: role.permissions.toArray().join(', ') || 'None', inline: false }
      )
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
