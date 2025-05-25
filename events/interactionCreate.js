const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  // CREATE TICKET
  if (interaction.customId.startsWith('create_ticket_')) {
    const [, categoryId, supportRoleId, everyoneRoleId, transcriptChannelId, banner] = interaction.customId.split('_');

    const existing = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
    if (existing) return interaction.reply({ content: `❌ You already have a ticket: ${existing}`, ephemeral: true });

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: [
        { id: everyoneRoleId, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: supportRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle('Ticket Opened')
      .setDescription(`👋 Hello <@${interaction.user.id}>, please wait for our team <@&${supportRoleId}> to assist you.`)
      .setColor('#2f3136');

    if (banner !== 'null') embed.setImage(banner);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 Close').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('reopen_ticket').setLabel('🔓 Reopen').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`transcript_ticket_${transcriptChannelId}`).setLabel('📝 Transcript').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('delete_ticket').setLabel('❌ Delete').setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${interaction.user.id}> <@&${supportRoleId}>`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
  }

  // CLOSE TICKET
  if (interaction.customId === 'close_ticket') {
    await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: false });
    await interaction.reply({ content: '🔒 Ticket closed.', ephemeral: true });
  }

  // REOPEN TICKET
  if (interaction.customId === 'reopen_ticket') {
    await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: true });
    await interaction.reply({ content: '🔓 Ticket reopened.', ephemeral: true });
  }

  // TRANSCRIPT
  if (interaction.customId.startsWith('transcript_ticket_')) {
    const transcriptChannelId = interaction.customId.split('_')[2];
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const content = messages.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
    const fileName = `transcript-${interaction.channel.id}.txt`;

    fs.writeFileSync(fileName, content);
    await interaction.guild.channels.cache.get(transcriptChannelId).send({
      content: `📝 Transcript for ${interaction.channel.name}`,
      files: [fileName]
    });

    await interaction.reply({ content: '📝 Transcript saved.', ephemeral: true });
  }

  // DELETE
  if (interaction.customId === 'delete_ticket') {
    await interaction.reply({ content: '❌ Deleting in 3 seconds...', ephemeral: true });
    setTimeout(() => interaction.channel.delete(), 3000);
  }
});
