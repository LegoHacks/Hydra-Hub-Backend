const { Command } = require("discord.js-commando");
const randomString = require("@utils/randomString");
const createEmbed = require("@utils/createEmbed");
const getCollection = require("@utils/getCollection");
const { ObjectID } = require("mongodb");

module.exports = class WhitelistCommand extends Command {
    constructor(client) {
        super(client, {
            name: "whitelist-user",
            aliases: ["whitelist", "wl"],
            group: "whitelist",
            memberName: "whitelist",
            description: "Whitelist a specified user.",
            args: [
                {
                    key: "user",
                    prompt: "Who is getting whitelisted?",
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
                    id: user.id,
                    whitelisted: false,
                    key: "",
                    scriptID: "",
                    hwid: ""
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

            if (_user.whitelisted) {
                message.say(createEmbed({
                    title: "Error",
                    description: `${user.username} is already whitelisted.`,
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            // creates a random key of size 12-15 and a random script ID of size 20-25
            const key = randomString(12 + Math.floor(Math.random() * 3));
            const scriptID = randomString(20 + Math.floor(Math.random() * 5));
            await collection.updateOne(_user, { $set: { key: key, scriptID: scriptID, whitelisted: true } });
            
            user.send(createEmbed({
                title: "Whitelisted",
                description: `You have been whitelisted by ${message.author.username}, your whitelist key is \`${key}\` and your script ID is \`${scriptID}\``
            }));
            message.say(createEmbed({
                title: "Success",
                description: `${user.username} has been whitelisted.`
            }));
            
            return _client.close();
        });
    };
};
