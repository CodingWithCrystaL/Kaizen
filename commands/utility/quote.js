const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const quotes = [
  "“Success is not final, failure is not fatal: it is the courage to continue that counts.” — Winston Churchill",
  "“Believe you can and you're halfway there.” — Theodore Roosevelt",
  "“Don’t watch the clock; do what it does. Keep going.” — Sam Levenson",
  "“Great things never came from comfort zones.”",
  "“Push yourself, because no one else is going to do it for you.”"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('🧠 Get a random motivational quote'),

  async execute(interaction) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const embed = new EmbedBuilder()
      .setTitle('🧠 Motivational Quote')
      .setDescription(`> ${quote}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
