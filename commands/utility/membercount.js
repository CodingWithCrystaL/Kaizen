const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('📊 View total member count of this server'),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const guild = interaction.guild;

    const total = guild.memberCount;
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;

    const embed = new EmbedBuilder()
      .setTitle('📊 Member Count')
      .addFields(
        { name: 'Total Members', value: `${total}`, inline: true },
        { name: 'Humans', value: `${humans}`, inline: true },
        { name: 'Bots', value: `${bots}`, inline: true }
      )
      .setColor('#ffffff')
      .setFooter({ text: `${guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
