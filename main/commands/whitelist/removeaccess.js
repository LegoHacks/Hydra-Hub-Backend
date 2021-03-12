const { Command } = require("discord.js-commando");
const createEmbed = require("@utils/createEmbed");
const getCollection = require("@utils/getCollection");

module.exports = class RemoveAccessCommand extends Command {
    constructor(client) {
        super(client, {
            name: "removewhitelistaccess",
            aliases: ["removeaccess", "delwlaccess", "removewhitelistaccess"],
            group: "whitelist",
            memberName: "removewhitelistaccess",
            description: "Remove whitelist command access from a specific user.",
            ownerOnly: true,
            args: [
                {
                    key: "user",
                    prompt: "Who is getting their access revoked?",
                    type: "user"
                }
            ]
        });
    };

    run(message, { user }) {
        return getCollection("users", async (collection, _client) => {
            let _user = await collection.findOne({id: user.id});

            if (!user || !_user.whitelistAccess) {
                message.say(createEmbed({
                    title: "Error",
                    description: `${user.username} doesn't have permission anyway.`,
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            await collection.updateOne(_user, { $set: { whitelistAccess: false } });

            user.send(createEmbed({
                title: "Whitelist Access Removed",
                description: `Your whitelist access has been removed by ${message.author.username}.`
            }));
            message.say(createEmbed({
                title: "Success",
                description: `${user.username} has had their access removed.`
            }));
            
            return _client.close();
        });
    };
};
