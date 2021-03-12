const { Command } = require("discord.js-commando");
const createEmbed = require("@utils/createEmbed");
const getCollection = require("@utils/getCollection");
const { ObjectID } = require("mongodb");

module.exports = class BlacklistCommand extends Command {
    constructor(client) {
        super(client, {
            name: "blacklist-user",
            aliases: ["blacklist", "bl"],
            group: "whitelist",
            memberName: "blacklist",
            description: "Blacklist a specified user.",
            args: [
                {
                    key: "user",
                    prompt: "Who is getting blacklisted?",
                    type: "user"
                }
            ]
        });
    };

    run(message, { user }) {
        return getCollection("users", async (collection, _client) => {
            let _user = await collection.findOne({id: user.id});
            let clientUser = await collection.findOne({id: message.author.id});

            if (!_user) {
                await collection.insertOne({
                    _id: ObjectID.createFromTime(Date.now()),
                    id: "",
                    whitelisted: false,
                    key: "",
                    scriptID: "",
                    hwid: "",
                    previousHwids: [],
                    robloxAccounts: []
                });
                _user = await collection.findOne({id: user.id});
            };

            if (!clientUser || !clientUser.whitelistAccess) {
                message.say(createEmbed({
                    title: "Error",
                    description: "You cannot run this command.",
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            if (!_user.whitelisted) {
                message.say(createEmbed({
                    title: "Error",
                    description: `${user.username} is already blacklisted/not whitelisted.`,
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            await collection.updateOne(_user, { $set: { whitelisted: false } });
            
            user.send(createEmbed({
                title: "Blacklisted",
                description: `You have been blacklisted by ${message.author.username}!`,
                colour: 0xFF0000
            }));
            message.say(createEmbed({
                title: "Success",
                description: `${user.username} has been blacklisted.`
            }));
            
            return _client.close();
        });
    };
};
