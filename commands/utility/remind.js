const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('⏳ Set a personal DM reminder')
    .addStringOption(option =>
      option.setName('time').setDescription('Time like 10m, 2h').setRequired(true))
    .addStringOption(option =>
      option.setName('message').setDescription('Reminder message').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;

    const timeInput = isSlash
      ? interaction.options.getString('time')
      : interaction.content.split(' ')[1];

    const message = isSlash
      ? interaction.options.getString('message')
      : interaction.content.split(' ').slice(2).join(' ');

    const delay = ms(timeInput);

    if (!timeInput || !delay || delay > 7 * 24 * 60 * 60 * 1000) {
      return interaction.reply({
        content: '⚠️ Provide a valid time (e.g., 10m, 2h, max 7d).',
        ephemeral: !isSlash
      });
    }

    const confirm = new EmbedBuilder()
      .setTitle('⏳ Reminder Set')
      .setDescription(`> I’ll remind you in \`${timeInput}\` about:\n> ${message}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [confirm] });

    setTimeout(async () => {
      try {
        const dm = await interaction.user.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('⏰ Reminder')
              .setDescription(`> ⏳ Time’s up! Here’s your reminder:\n> ${message}`)
              .setColor('#ffffff')
              .setTimestamp()
          ]
        });
      } catch {
        // DM failed (user may have DMs off)
      }
    }, delay);
  }
};
