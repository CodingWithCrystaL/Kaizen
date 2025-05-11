const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('🖼️ View the avatar of a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to view').setRequired(false)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const user = isSlash
      ? interaction.options.getUser('user') || interaction.user
      : interaction.mentions.users.first() || interaction.author;

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar — ${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
