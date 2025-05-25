const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const getSettings = require('../utils/getSettings');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Slash Command
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
      }
      return;
    }

    // Button Interaction
    if (interaction.isButton()) {
      const { guild, member, customId } = interaction;
      const settings = getSettings(guild.id);
      if (!settings) {
        return interaction.reply({ content: '⚠️ Ticket system not configured. Use `/setup_tickets`.', ephemeral: true });
      }

      // Create Ticket Button
      if (customId === 'create_ticket') {
        const existingChannel = guild.channels.cache.find(c =>
          c.name === `ticket-${member.user.username.toLowerCase()}`
        );

        if (existingChannel) {
          return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
        }

        const ticketChannel = await guild.channels.create({
          name: `ticket-${member.user.username}`,
          type: ChannelType.GuildText,
          parent: settings.supportCategory,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: member.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
            {
              id: settings.supportRole,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ],
        });

        await ticketChannel.send({
          content: `Hello ${member}, a staff member will assist you soon.\nClick the button below to close this ticket.`,
          components: [{
            type: 1,
            components: [
              {
                type: 2,
                label: 'Close Ticket',
                style: 4,
                custom_id: 'close_ticket',
              },
            ],
          }],
        });

        await interaction.reply({ content: `✅ Ticket created: ${ticketChannel}`, ephemeral: true });
        return;
      }

      // Close Ticket Button
      if (customId === 'close_ticket') {
        const channel = interaction.channel;

        try {
          const transcript = await discordTranscripts.createTranscript(channel);
          const logChannel = await guild.channels.fetch(settings.logChannel);
          await logChannel.send({
            content: `📄 Transcript from ${channel.name} (closed by ${interaction.user.tag})`,
            files: [transcript],
          });

          await channel.send('✅ Ticket will be deleted in 5 seconds.');
          setTimeout(() => channel.delete(), 5000);
        } catch (err) {
          console.error('Transcript error:', err);
          await interaction.reply({ content: '❌ Failed to save transcript.', ephemeral: true });
        }
        return;
      }
    }
  },
};
