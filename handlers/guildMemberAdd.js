const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    const dbPath = path.join(__dirname, '../data/welcome.json');
    const db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};
    const conf = db[member.guild.id];
    if (!conf || !conf.enabled || !conf.channel) return;

    const channel = member.guild.channels.cache.get(conf.channel);
    if (!channel) return;

    const canvas = Canvas.createCanvas(900, 300);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('https://i.imgur.com/WLw8nbU.png');
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
    ctx.fillText(`Welcome, ${member.user.username}`, 270, 140);
    ctx.font = '28px Sans';
    ctx.fillText(`to ${member.guild.name}`, 270, 190);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });

    const embed = new EmbedBuilder()
      .setTitle('👋 Welcome!')
      .setDescription(`Glad to have you with us, ${member}!`)
      .setColor('#ffffff')
      .setImage('attachment://welcome.png')
      .setFooter({ text: member.guild.name })
      .setTimestamp();

    channel.send({ embeds: [embed], files: [attachment] }).catch(() => {});

    // Optional autorole
    if (conf.autorole) {
      const role = member.guild.roles.cache.get(conf.autorole);
      if (role) member.roles.add(role).catch(() => {});
    }
  }
};
