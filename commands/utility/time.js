const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('⏰ Get current time in any timezone')
    .addStringOption(option =>
      option.setName('location').setDescription('Timezone like Asia/Kolkata').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const location = isSlash
      ? interaction.options.getString('location')
      : interaction.content.split(' ').slice(1).join(' ');

    if (!location) {
      return interaction.reply({ content: '⚠️ Please provide a timezone (e.g. Asia/Kolkata)', ephemeral: !isSlash });
    }

    try {
      const res = await axios.get(`https://worldtimeapi.org/api/timezone/${encodeURIComponent(location)}`);
      const data = res.data;

      const embed = new EmbedBuilder()
        .setTitle('⏰ World Time')
        .addFields(
          { name: 'Location', value: `${data.timezone}`, inline: true },
          { name: 'Current Time', value: `${data.datetime.slice(0, 19).replace('T', ' ')}`, inline: true },
          { name: 'UTC Offset', value: `${data.utc_offset}`, inline: true }
        )
        .setColor('#ffffff')
        .setFooter({ text: `${interaction.guild.name}` })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      interaction.reply({ content: '❌ Invalid timezone or unable to fetch time.', ephemeral: !isSlash });
    }
  }
};
