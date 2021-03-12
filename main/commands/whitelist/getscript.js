const { Command } = require("discord.js-commando");
const createEmbed = require("@utils/createEmbed");
const getCollection = require("@utils/getCollection");

module.exports = class GetScriptCommand extends Command {
    constructor(client) {
        super(client, {
            name: "getscript-user",
            aliases: ["getscript", "getfile", "script", "gs"],
            group: "whitelist",
            memberName: "getscript",
            description: "Get the script.",
        });
    };

    run(message) {
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
            
            message.author.send(createEmbed({
                title: "Success",
                message: [{name: "Script", value: `
                \`\`\`lua\ngetgenv().key, getgenv().scriptID = "${_user.key}", "${_user.scriptID}";\n\nloadstring(game:HttpGet(("http://localhost:3000/script/%s"):format(scriptID)))();\`\`\`
                `}]
            }));
            
            return _client.close();
        });
    };
}
