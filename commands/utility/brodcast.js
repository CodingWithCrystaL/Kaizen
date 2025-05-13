const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const BOT_OWNER_ID = '1193918827537371136';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('📢 DM everyone in this server with a plain message (owner only)')
    .addStringOption(option =>
      option.setName('message').setDescription('Message to send').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'broadcast',
  description: 'Send a plain text DM to all server members (owner only)',

  async execute(interaction) {
    if (interaction.user.id !== BOT_OWNER_ID) {
      return interaction.reply({ content: '❌ Only the bot owner can use this command.', ephemeral: true });
    }

    const msg = interaction.options.getString('message');
    const members = await interaction.guild.members.fetch();
    let sent = 0;

    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send(msg);
        sent++;
      } catch {}
    }

    interaction.reply({
      content: `✅ Message sent to **${sent}** members.`,
      ephemeral: true
    });
  },

  async run(client, message, args) {
    if (message.author.id !== BOT_OWNER_ID) {
      return message.reply('❌ Only the bot owner can use this command.');
    }

    const msg = args.join(' ');
    if (!msg) return message.reply('⚠️ Please provide a message.');

    const members = await message.guild.members.fetch();
    let sent = 0;

    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send(msg);
        sent++;
      } catch {}
    }

    message.reply(`✅ Message sent to **${sent}** members.`);
  }
};
