const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/welcome.json');

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcomemsg')
    .setDescription('✍️ Set a custom welcome message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message with placeholders like {user}, {server}, {count}')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const rawMsg = isSlash
      ? interaction.options.getString('message')
      : interaction.content.split(' ').slice(1).join(' ');

    const db = JSON.parse(fs.readFileSync(dbPath));
    const guildId = interaction.guild.id;
    db[guildId] = db[guildId] || {};
    db[guildId].message = rawMsg;

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('✍️ Welcome Message Updated')
      .setDescription(`> New welcome message:\n> \`${rawMsg}\``)
      .setColor('#ffffff')
      .setFooter({ text: `${interaction.guild.name}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
