const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('📘 Get the definition of a word')
    .addStringOption(option =>
      option.setName('word').setDescription('The word to define').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const word = isSlash
      ? interaction.options.getString('word')
      : interaction.content.split(' ').slice(1).join(' ');

    if (!word) {
      return interaction.reply({ content: '⚠️ Please enter a word to define.', ephemeral: !isSlash });
    }

    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const entry = res.data[0];
      const meaning = entry.meanings[0];
      const definition = meaning.definitions[0];

      const embed = new EmbedBuilder()
        .setTitle(`📘 Definition of "${entry.word}"`)
        .addFields(
          { name: 'Part of Speech', value: meaning.partOfSpeech, inline: true },
          { name: 'Meaning', value: definition.definition, inline: false }
        )
        .setColor('#ffffff')
        .setFooter({ text: `${interaction.guild.name}` })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      interaction.reply({ content: '❌ Word not found.', ephemeral: !isSlash });
    }
  }
};
