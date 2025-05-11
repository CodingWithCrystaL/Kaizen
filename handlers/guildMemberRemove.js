const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'guildMemberRemove',

  async execute(member) {
    const dbPath = path.join(__dirname, '../data/welcome.json');
    const db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};
    const conf = db[member.guild.id];
    if (!conf || !conf.channel) return;

    const channel = member.guild.channels.cache.get(conf.channel);
    if (!channel) return;

    const canvas = Canvas.createCanvas(900, 300);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('https://i.imgur.com/WLw8nbU.png'); // Same dark bg
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 50, 50, 200, 200);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Sans';
    ctx.fillText(`${member.user.username} left the server`, 270, 150);
    ctx.font = '28px Sans';
    ctx.fillText(`Goodbye from ${member.guild.name}`, 270, 200);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'goodbye.png' });

    const embed = new EmbedBuilder()
      .setTitle('👋 Farewell!')
      .setDescription(`${member.user.username} has left the server.`)
      .setImage('attachment://goodbye.png')
      .setColor('#ffffff')
      .setFooter({ text: member.guild.name })
      .setTimestamp();

    channel.send({ embeds: [embed], files: [attachment] }).catch(() => {});
  }
};
