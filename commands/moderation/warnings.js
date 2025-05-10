const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const warnPath = path.join(__dirname, '../../data/warns.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('📋 View a user\'s warnings')
    .addUserOption(option =>
      option.setName('target').setDescription('User to check warnings for').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const user = isSlash
      ? interaction.options.getUser('target')
      : interaction.mentions.users.first();

    if (!user) {
      return interaction.reply({ content: '⚠️ Please mention a user.', ephemeral: !isSlash });
    }

    const warns = JSON.parse(fs.readFileSync(warnPath));
    const id = interaction.guild.id + user.id;

    const userWarns = warns[id] || [];

    const embed = new EmbedBuilder()
      .setTitle(`📋 Warnings for ${user.tag}`)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    if (userWarns.length === 0) {
      embed.setDescription(`> **${user.tag}** has no warnings.`);
    } else {
      const list = userWarns.map((warn, i) =>
        `**${i + 1}.** ${warn.reason} — *by ${warn.moderator}*`
      ).join('\n');
      embed.setDescription(list);
    }

    interaction.reply({ embeds: [embed] });
  }
};
