const { Command } = require("discord.js-commando");
const createEmbed = require("@utils/createEmbed");
const getCollection = require("@utils/getCollection");
const { ObjectID } = require("mongodb");

module.exports = class AccessCommand extends Command {
    constructor(client) {
        super(client, {
            name: "givewhitelistaccess",
            aliases: ["giveaccess", "whitelistaccess", "wlaccess", "givewhitelistaccess"],
            group: "whitelist",
            memberName: "givewhitelistaccess",
            description: "Give whitelist command access to a specified user.",
            ownerOnly: true,
            args: [
                {
                    key: "user",
                    prompt: "Who is getting access?",
                    type: "user"
                }
            ]
        });
    };

    run(message, { user }) {
        return getCollection("users", async (collection, _client) => {
            let _user = await collection.findOne({id: user.id});

            if (!_user) {
                await collection.insertOne({
                    _id: ObjectID.createFromTime(Date.now()),
                    id: user.id,
                    whitelisted: false,
                    key: "",
                    scriptID: "",
                    hwid: "",
                    whitelistAccess: false
                });
                _user = await collection.findOne({id: user.id});
            };

            if (_user.whitelistAccess) {
                message.say(createEmbed({
                    title: "Error",
                    description: `${user.username} already has whitelist permissions.`,
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            await collection.updateOne(_user, { $set: { whitelistAccess: true } });

            user.send(createEmbed({
                title: "Whitelisted Access",
                description: `You have been given whitelist access by ${message.author.username}.`
            }));
            message.say(createEmbed({
                title: "Success",
                description: `${user.username} has been given access.`
            }));
            
            return _client.close();
        });
    };
};
