const { Command } = require("discord.js-commando");
const createEmbed = require("@utils/createEmbed");
const getCollection = require("@utils/getCollection");
const { ObjectID } = require("mongodb");

module.exports = class TransferCommand extends Command {
    constructor(client) {
        super(client, {
            name: "transfer-whitelist",
            aliases: ["transfer"],
            group: "whitelist",
            memberName: "transfer",
            description: "Transfers a whitelist from an old discord account to a new one.",
            args: [
                {
                    key: "oldUserId",
                    prompt: "What is the ID of the old discord account?",
                    type: "string"
                }, 
                {
                    key: "newUserId",
                    prompt: "What is the ID of the new discord account?",
                    type: "string"
                }
            ]
        });
    };

    run(message, { oldUserId, newUserId }) {
        return getCollection("users", async (collection, _client) => {
            let oldUser = await collection.findOne({id: oldUserId});
            let user = await collection.findOne({id: newUserId});
            let member = message.client.users.cache.get(newUserId);
            let clientUser = await collection.findOne({id: message.author.id});

            // if the old account doesn't exist in the database or isn't whitelisted throw error
            if (!oldUser || !oldUser.whitelisted || !member) {
                message.say(createEmbed({
                    title: "Error",
                    description: "The old account either doesn't exist or isn't whitelisted.",
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            if (!user) {
                await collection.insertOne({
                    _id: ObjectID.createFromTime(Date.now()),
                    id: newUserId,
                    whitelisted: false,
                    key: "",
                    scriptID: "",
                    hwid: "",
                    previousHwids: [],
                    robloxAccounts: []
                });
                user = await collection.findOne({id: newUserId});
            };

            if (!clientUser || !clientUser.whitelistAccess) {
                message.say(createEmbed({
                    title: "Error",
                    description: "You cannot run this command.",
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            if (user.whitelisted) {
                message.say(createEmbed({
                    title: "Error",
                    description: `The second user is already whitelisted.`,
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            const key = oldUser.key;
            const scriptID = oldUser.scriptID;
            await collection.updateOne(user, { $set: { key: key, scriptID: scriptID, whitelisted: true } });
            await collection.deleteOne(oldUser); // removes the old user from the database
            
            member.send(createEmbed({
                title: "Whitelist transferred",
                description: `You have had your whitelist transferred by ${message.author.username}, your whitelist key is \`${key}\` and your script ID is \`${scriptID}\``
            }));
            message.say(createEmbed({
                title: "Success",
                description: `${member.username} have had their whitelist successfully transferred.`
            }));
            
            return _client.close();
        });
    };
};
