const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('🔗 Get the bot\'s invite link'),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;

    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=${PermissionsBitField.All}&scope=bot%20applications.commands`;

    const embed = new EmbedBuilder()
      .setTitle('🔗 Invite Kaizen')
      .setDescription(`[Click here to invite this bot to your server](${inviteLink})`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
