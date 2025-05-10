const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const warnPath = path.join(__dirname, '../../data/warns.json');

if (!fs.existsSync(warnPath)) {
  fs.mkdirSync(path.dirname(warnPath), { recursive: true });
  fs.writeFileSync(warnPath, JSON.stringify({}));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('📋 View a user\'s warnings')
    .addUserOption(option =>
      option.setName('target').setDescription('User to check').setRequired(true)),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const user = isSlash
      ? interaction.options.getUser('target')
      : interaction.mentions.users.first();

    if (!user) {
      return interaction.reply({ content: '⚠️ Mention a user.', ephemeral: !isSlash });
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
      embed.setDescription(`> No warnings for **${user.tag}**.`);
    } else {
      embed.setDescription(userWarns.map((warn, i) =>
        `**${i + 1}.** ${warn.reason} — *by ${warn.moderator}*`
      ).join('\n'));
    }

    interaction.reply({ embeds: [embed] });
  }
};
