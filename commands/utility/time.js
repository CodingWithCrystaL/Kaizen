const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const timezoneMap = {
  delhi: 'Asia/Kolkata',
  mumbai: 'Asia/Kolkata',
  kolkata: 'Asia/Kolkata',
  london: 'Europe/London',
  paris: 'Europe/Paris',
  berlin: 'Europe/Berlin',
  newyork: 'America/New_York',
  losangeles: 'America/Los_Angeles',
  sydney: 'Australia/Sydney',
  tokyo: 'Asia/Tokyo',
  dubai: 'Asia/Dubai',
  singapore: 'Asia/Singapore'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('⏰ Get current time in any city or timezone')
    .addStringOption(option =>
      option.setName('location').setDescription('City or timezone (e.g. delhi or Asia/Kolkata)').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    let input = isSlash
      ? interaction.options.getString('location')
      : interaction.content.split(' ').slice(1).join(' ');

    if (!input) {
      return interaction.reply({ content: '⚠️ Please provide a city or timezone.', ephemeral: !isSlash });
    }

    input = input.toLowerCase().replace(/ /g, '');
    const timezone = timezoneMap[input] || input;

    try {
      const res = await axios.get(`https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`);
      const data = res.data;

      const embed = new EmbedBuilder()
        .setTitle(`⏰ Time in ${data.timezone}`)
        .addFields(
          { name: 'Current Time', value: data.datetime.slice(0, 19).replace('T', ' '), inline: true },
          { name: 'UTC Offset', value: data.utc_offset, inline: true }
        )
        .setColor('#ffffff')
        .setFooter({ text: `${interaction.guild.name}` })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch {
      interaction.reply({ content: '❌ Invalid city or timezone.', ephemeral: !isSlash });
    }
  }
};
