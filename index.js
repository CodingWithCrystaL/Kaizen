const fs = require('fs');
const path = require('path');
const express = require('express');
const {
  Client, GatewayIntentBits, Collection, ActivityType,
  REST, Routes, Partials, ChannelType, PermissionsBitField,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, ModalBuilder,
  Events, SlashCommandBuilder
} = require('discord.js');
require('dotenv').config();

const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// KeepAlive for Render
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('🌐 KeepAlive server running on port 3000'));

// Collections
const prefix = '.';
client.commands = new Collection();       // slash
client.prefixCommands = new Collection(); // prefix

// Load commands
const commandFolders = ['moderation', 'utility', 'welcome', 'admin'];
for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(folderPath)) continue;
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(path.join(folderPath, file));
    if (cmd.data) client.commands.set(cmd.data.name, cmd);
    if (cmd.name && cmd.run) client.prefixCommands.set(cmd.name, cmd);
  }
}

// Slash command registration
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commands = [
    ...client.commands.map(cmd => cmd.data.toJSON()),
    new SlashCommandBuilder().setName('sendpanel').setDescription('Send the ticket panel')
  ];

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Slash commands registered.');
  } catch (err) {
    console.error('❌ Failed to register:', err);
  }

  // Bot status
  const statuses = [
    () => `👤 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`,
    () => `.help | Kaizen`,
    () => `🌐 ${client.guilds.cache.size} servers`
  ];
  let i = 0;
  setInterval(() => {
    client.user.setActivity(statuses[i++ % statuses.length](), { type: ActivityType.Watching });
  }, 10000);
});

// Prefix handler
client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();
  const cmd = client.prefixCommands.get(cmdName);
  if (!cmd) return;
  try {
    await cmd.run(client, message, args);
  } catch (err) {
    console.error(`❌ Prefix Error: ${cmdName}`, err);
    await message.channel.send('❌ Something went wrong.');
  }
});

// Interaction Handler
let panelData = {
  title: "Shop & Support Tickets",
  description: "To create a ticket, click the button below!",
  image: config.defaultImage
};

let ticketTemplate = {
  shop: {
    before: "🛒 **Shop Ticket Summary**",
    after: "We’ll be with you shortly!"
  },
  support: {
    before: "🔧 **Support Ticket**",
    after: "Please describe your issue clearly."
  }
};

client.on(Events.InteractionCreate, async interaction => {
  // Slash command: /sendpanel
  if (interaction.isChatInputCommand() && interaction.commandName === 'sendpanel') {
    const embed = new EmbedBuilder()
      .setTitle(panelData.title)
      .setDescription(panelData.description)
      .setColor("#ffffff")
      .setImage(panelData.image);

    const panelRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("create-ticket").setLabel("🎟️ Create Ticket").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("edit-panel").setLabel("🛠️ Edit Panel").setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ content: "✅ Panel Sent!", ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [panelRow] });
  }

  // Button: Edit Panel
  if (interaction.isButton()) {
    if (interaction.customId === "edit-panel") {
      const modal = new ModalBuilder().setCustomId("editPanelModal").setTitle("Edit Ticket Panel")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("title").setLabel("Panel Title").setStyle(TextInputStyle.Short).setRequired(true).setValue(panelData.title)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("desc").setLabel("Panel Description").setStyle(TextInputStyle.Paragraph).setRequired(true).setValue(panelData.description)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("image").setLabel("Panel Image URL").setStyle(TextInputStyle.Short).setRequired(false).setValue(panelData.image)
          )
        );
      await interaction.showModal(modal);
    }

    if (interaction.customId === "create-ticket") {
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId("ticket-type").setPlaceholder("Choose a category")
          .addOptions([
            { label: "Support", value: "support", description: "Open a support ticket" },
            { label: "Shop", value: "shop", description: "Open a shop ticket" }
          ])
      );
      await interaction.reply({ content: "Select your ticket type:", components: [menu], ephemeral: true });
    }
  }

  // Modal: Edit Panel
  if (interaction.isModalSubmit() && interaction.customId === "editPanelModal") {
    panelData.title = interaction.fields.getTextInputValue("title");
    panelData.description = interaction.fields.getTextInputValue("desc");
    panelData.image = interaction.fields.getTextInputValue("image") || config.defaultImage;

    await interaction.reply({ content: "✅ Panel updated!", ephemeral: true });
  }

  // Dropdown: Ticket type
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket-type") {
    const type = interaction.values[0];

    const modal = new ModalBuilder().setCustomId(`modal-${type}`).setTitle(`Create ${type} Ticket`);

    if (type === "shop") {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("product").setLabel("Product Name").setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("payment").setLabel("Payment Method").setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("desc").setLabel("Description").setStyle(TextInputStyle.Paragraph).setRequired(true)
        )
      );
    } else {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("issue").setLabel("Describe your issue").setStyle(TextInputStyle.Paragraph).setRequired(true)
        )
      );
    }

    await interaction.showModal(modal);
  }

  // Modal: Create Ticket
  if (interaction.isModalSubmit() && interaction.customId.startsWith("modal-")) {
    const type = interaction.customId.split("-")[1];
    const member = interaction.member;
    const guild = interaction.guild;

    const name = type === "shop" ? interaction.fields.getTextInputValue("product") : "support";
    const channelName = `${type}-ticket-${member.user.username}-${name.toLowerCase().replace(/[^a-z0-9]/gi, "")}`.slice(0, 90);

    if (guild.channels.cache.find(c => c.name === channelName))
      return interaction.reply({ content: "❌ You already have a ticket open.", ephemeral: true });

    const category = config[`${type}Category`];
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: config.supportRole, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    const details = type === "shop"
      ? `📦 Product: ${interaction.fields.getTextInputValue("product")}\n💳 Payment: ${interaction.fields.getTextInputValue("payment")}\n📝 ${interaction.fields.getTextInputValue("desc")}`
      : `📝 ${interaction.fields.getTextInputValue("issue")}`;

    const embed = new EmbedBuilder()
      .setTitle("Ticket Opened")
      .setDescription(`${ticketTemplate[type].before}\n\n${details}\n\n${ticketTemplate[type].after}`)
      .setColor("#ffffff")
      .setImage(panelData.image);

    await channel.send({ content: `<@${member.id}> <@&${config.supportRole}>`, embeds: [embed] });
    await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
  }
});
client.login(process.env.DISCORD_TOKEN);
