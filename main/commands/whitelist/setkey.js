const { Command } = require("discord.js-commando");
const createEmbed = require("@utils/createEmbed");
const getCollection = require("@utils/getCollection");
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");

module.exports = class SetKeyCommand extends Command {
    constructor(client) {
        super(client, {
            name: "setkey-user",
            aliases: ["setkey", "changekey"],
            group: "whitelist",
            memberName: "setkey",
            description: "Change your whitelist key.",
            args: [
                {
                    key: "newKey",
                    prompt: "What is the key you want to change?",
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

    run(message, { newKey }) {
        if (message.guild) return message.say(createEmbed({
            title: "Error",
            description: `You can only run this command in dms.`,
            colour: 0xFF0000
        }));
        return getCollection("users", async (collection, _client) => {
            let _user = await collection.findOne({id: message.author.id});

            if (!_user || !_user.whitelisted) {
                message.say(createEmbed({
                    title: "Error",
                    description: `You are not whitelisted.`,
                    colour: 0xFF0000
                }));
                return _client.close();
            };

            let oldKey = _user.key;
            await collection.updateOne(_user, { $set: { key: newKey } });
            
            message.author.send(createEmbed({
                title: "Success",
                description: `You have successfully changed your key from ${oldKey} to ${newKey}`
            }));
            
            return _client.close();
        });
    };
}
