const { name } = process.env;
const { MessageEmbed } = require("discord.js");

module.exports = options => {
    let embed = new MessageEmbed()
        .setTitle(options.title || "")
        .setColor(options.colour || 0x00B0FF)
        .setDescription(options.description || "")
        .setImage(options.image || "")
        .setFooter(options.footer || name)
        .setAuthor(options.author || "")
        .setTimestamp();

    if (!options.thumbnail) {
        embed.setThumbnail(options.thumbnail || "https://media.discordapp.net/attachments/810914692624941086/811528996512595968/4a9911b22b1ae3e31112c20d5445b75a.jpg"); // You can change this image to anything
    };

    if (options.message) {
        options.message.forEach(field => {
            embed.addField(field.name, field.value, field.inline);
        });
    };

    return embed;
};
