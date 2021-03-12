const { Command } = require("discord.js-commando");
const createEmbed = require("@utils/createEmbed");
const randomString = require("@utils/randomString");
const getCollection = require("@utils/getCollection");
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
const { ObjectID } = require("mongodb");

module.exports = class RedeemCommand extends Command {
    constructor(client) {
        super(client, {
            name: "redeem-key",
            aliases: ["redeem", "redeemkey"],
            group: "whitelist",
            memberName: "redeem",
            description: "Redeem a whitelist key.",
            args: [
                {
                    key: "key",
                    prompt: "What is the key you want to redeem?",
                    type: "string",
                    // makes sure they can't use any characters like "'` etc to break the database
                    validate: key => {
                        let valid = true;
                        [...key].forEach(letter => {
                            if (!characters.includes(letter)) {
                                valid = false;
                            };
                        });
                        return valid;
                    }
                }
            ]
        });
    };

    run(message, { key }) {
        if (message.guild) return message.say(createEmbed({
            title: "Error",
            description: `You can only run this command in dms.`,
            colour: 0xFF0000
        }));
        return getCollection("redeemableKeys", async (collection, _client) => {
            let redeemableKey = await collection.findOne({key: key});

            if (!redeemableKey) {
                message.say(createEmbed({
                    title: "Error",
                    description: `Invalid key provided.`,
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            if (redeemableKey.redeemed) {
                message.say(createEmbed({
                    title: "Error",
                    description: `This key has already been redeemed by ${redeemableKey.redeemedBy}.`,
                    colour: 0xFF0000
                }));
                return _client.close();
            };


            await getCollection("users", async (_collection, __client) => {
                let _user = await _collection.findOne({id: message.author.id});

                if (!_user) {
                    await _collection.insertOne({
                        _id: ObjectID.createFromTime(Date.now()),
                        id: message.author.id,
                        whitelisted: false,
                        key: "",
                        scriptID: "",
                        hwid: ""
                    });
                    _user = await _collection.findOne({id: message.author.id});
                };

                if (_user.whitelisted) {
                    message.say(createEmbed({
                        title: "Error",
                        description: `You are already whitelisted. The key has not been redeemed.`,
                        colour: 0xFF0000
                    }));
                    return __client.close();
                };

                await getCollection("redeemableKeys", async (__collection, ___client) => {
                    await __collection.updateOne(redeemableKey, { $set: { redeemed: true, redeemedBy: message.author.tag } });
                    return ___client.close();
                });

                // creates a random key of size 12-15 and a random script ID of size 20-25
                const key = randomString(12 + Math.floor(Math.random() * 3));
                const scriptID = randomString(20 + Math.floor(Math.random() * 5));
                await _collection.updateOne(_user, { $set: { key: key, scriptID: scriptID, whitelisted: true } });
                
                message.author.send(createEmbed({
                    title: "Success",
                    description: `You are now whitelisted, do \`!getscript\` to get the script and \`!setkey <key>\` to change your whitelist key.`
                }));

                return __client.close();
            });
            
            return _client.close();
        });
    };
}
