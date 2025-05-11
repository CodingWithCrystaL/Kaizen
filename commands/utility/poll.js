const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('📊 Create a yes/no poll')
    .addStringOption(option =>
      option.setName('question').setDescription('Your poll question').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const question = isSlash
      ? interaction.options.getString('question')
      : interaction.content.split(' ').slice(1).join(' ');

    if (!question) {
      return interaction.reply({ content: '⚠️ Please enter a poll question.', ephemeral: !isSlash });
    }

    const embed = new EmbedBuilder()
      .setTitle('📊 New Poll')
      .setDescription(`> ${question}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    const sent = await interaction.reply({ embeds: [embed], fetchReply: true });
    await sent.react('✅');
    await sent.react('❌');
  }
};
