const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('previewwelcome')
    .setDescription('👀 Preview the welcome card'),

  async execute(interaction) {
    const user = interaction.user;
    const guild = interaction.guild;

    const canvas = Canvas.createCanvas(900, 300);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('https://i.imgur.com/WLw8nbU.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 50, 50, 200, 200);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Sans';
    ctx.fillText(`Welcome, ${user.username}`, 270, 140);
    ctx.font = '28px Sans';
    ctx.fillText(`to ${guild.name}`, 270, 190);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });

    const embed = new EmbedBuilder()
      .setTitle('👋 Preview: Welcome!')
      .setDescription(`Glad to have you here, ${user}!`)
      .setColor('#ffffff')
      .setImage('attachment://welcome.png')
      .setFooter({ text: guild.name })
      .setTimestamp();

    interaction.reply({ embeds: [embed], files: [attachment] });
  }
};
