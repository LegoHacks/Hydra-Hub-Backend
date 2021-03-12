const { Command } = require("discord.js-commando");
const createEmbed = require("@utils/createEmbed");
const randomString = require("@utils/randomString");
const getCollection = require("@utils/getCollection");

module.exports = class GenKeyCommand extends Command {
    constructor(client) {
        super(client, {
            name: "generate-key(s)",
            aliases: ["genkey", "genkeys"],
            group: "whitelist",
            memberName: "genkey",
            description: "Generate key(s).",
            ownerOnly: true,
            args: [
                {
                    key: "amount",
                    prompt: "How many keys do you want to generate?",
                    type: "integer",
                    // you can't generate negative keys (obviously lmfao), or more than 20 at a time
                    validate: amount => {
                        return amount > 0 && amount <= 20;
                    }
                },
                {
                    key: "customName",
                    prompt: "What do you want the key to be?",
                    type: "string",
                    default: ""
                }
            ]
        });
    };

    run(message, { amount, customName }) {
        return getCollection("redeemableKeys", async (collection, _client) => {
            let fields = [];

            if (amount == 1) {

                await collection.insertOne({
                    redeemedBy: "",
                    redeemed: false,
                    key: customName
                });

                message.say(createEmbed({
                    title: "Success",
                    description: `Whitelist key \`${customName}\` has been created.`
                }));
                return _client.close();
            };

            for (let keyNumber = 1; keyNumber <= amount; keyNumber++) {
                let key = randomString(20 + Math.floor(Math.random() * 15));
            
                await collection.insertOne({ 
                    redeemedBy: "",
                    redeemed: false,
                    key: key
                });

                fields.push({name: `Key ${keyNumber}`, value: key});
            };

            message.say(createEmbed({
                title: "Success",
                description: `All keys have been generated successfully.`,
                message: fields
            }));
            return _client.close();
        });
    };
}
