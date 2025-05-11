const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('☁️ Get simple weather for a city')
    .addStringOption(option =>
      option.setName('city').setDescription('City name').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const city = isSlash
      ? interaction.options.getString('city')
      : interaction.content.split(' ').slice(1).join(' ');

    if (!city) {
      return interaction.reply({ content: '⚠️ Please provide a city name.', ephemeral: !isSlash });
    }

    try {
      const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
      const weather = response.data;

      const embed = new EmbedBuilder()
        .setTitle(`☁️ Weather`)
        .setDescription(`> ${weather}`)
        .setColor('#ffffff')
        .setFooter({ text: `${interaction.guild.name}` })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      interaction.reply({ content: '❌ Unable to get weather right now.', ephemeral: !isSlash });
    }
  }
};
