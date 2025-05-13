const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const BOT_OWNER_ID = '1193918827537371136';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('📢 Send a message to all members of this server via DM (owner only)')
    .addStringOption(option =>
      option.setName('message').setDescription('The message to send').setRequired(true)),

  name: 'broadcast',
  description: 'DM everyone in the server (owner only)',

  async execute(interaction) {
    if (interaction.user.id !== BOT_OWNER_ID) {
      return interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
    }

    const msg = interaction.options.getString('message');
    const members = await interaction.guild.members.fetch();
    let sent = 0;

    const embed = new EmbedBuilder()
      .setDescription(msg)
      .setColor('#ffffff')
      .setTimestamp();

    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send({ embeds: [embed] });
        sent++;
      } catch {}
    }

    const confirm = new EmbedBuilder()
      .setTitle('✅ Broadcast Sent')
      .setDescription(`Message delivered to **${sent}** members.`)
      .setColor('#ffffff')
      .setTimestamp();

    interaction.reply({ embeds: [confirm], ephemeral: true });
  },

  async run(client, message, args) {
    if (message.author.id !== BOT_OWNER_ID) {
      return message.reply('❌ Only the bot owner can use this command.');
    }

    const msg = args.join(' ');
    if (!msg) return message.reply('⚠️ Please provide a message.');

    const members = await message.guild.members.fetch();
    let sent = 0;

    const embed = new EmbedBuilder()
      .setDescription(msg)
      .setColor('#ffffff')
      .setTimestamp();

    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send({ embeds: [embed] });
        sent++;
      } catch {}
    }

    message.reply(`✅ Message sent to **${sent}** members.`);
  }
};
