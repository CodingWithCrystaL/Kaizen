const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('🗣️ Make the bot say something')
    .addStringOption(option =>
      option.setName('message').setDescription('Message to send').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;

    const message = isSlash
      ? interaction.options.getString('message')
      : interaction.content.split(' ').slice(1).join(' ');

    if (!message) {
      return interaction.reply({ content: '⚠️ Please provide a message to say.', ephemeral: !isSlash });
    }

    const embed = new EmbedBuilder()
      .setDescription(message)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
