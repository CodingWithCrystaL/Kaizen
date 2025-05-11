const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('previewgoodbye')
    .setDescription('👋 Preview the goodbye card'),

  async execute(interaction) {
    const isSlash = !!interaction.commandName;
    const user = interaction.user;

    const canvas = Canvas.createCanvas(900, 300);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('https://i.imgur.com/WLw8nbU.png'); // same bg
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
    ctx.fillText(`${user.username} left the server`, 270, 150);
    ctx.font = '28px Sans';
    ctx.fillText(`Goodbye from ${interaction.guild.name}`, 270, 200);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'goodbye.png' });

    const embed = new EmbedBuilder()
      .setTitle('👋 Preview: Farewell')
      .setDescription(`${user.username} has left the server.`)
      .setImage('attachment://goodbye.png')
      .setColor('#ffffff')
      .setFooter({ text: interaction.guild.name })
      .setTimestamp();

    interaction.reply({ embeds: [embed], files: [attachment] });
  }
};
