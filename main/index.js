/*
    Hydra Hub's Whitelist Bot
    DaDude#3044
*/
require("module-alias/register");
require("dotenv").config();
const { token, name, hmac_key } = process.env;
const { Client } = require("discord.js-commando");
const { App } = require("@tinyhttp/app");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const randomString = require("@utils/randomString");
const fs = require("fs");
const path = require("path");

if (!token) throw new Error(`${name} No token provided.`);

// sets up the client
const client = new Client({
    commandPrefix: "!", // feel free to change the prefix
    owner: "352217216344653824",
    invite: "https://discord.gg/hydra"
});

// setup command handler
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ["whitelist", "Whitelist Commands"],
        ["misc", "Miscellaneous Commands"]
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        prefix: false
    })
    .registerCommandsIn(path.join(__dirname, "commands"));

// setup event handler
fs.readdir("main/events", (err, files) => {
    if (err) return console.error;
    files.forEach(file => {
        client.on(file.split(".")[0], require(`./events/${file}`).bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });

    console.log("Events Loaded!");
});

// webserver
const app = new App();
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true }));

require("express-async-errors");

app.get("/", (req, res) => res.json({ "Success": true, "Signature": crypto.createHmac("sha3-256", hmac_key).update(randomString(12)).digest("hex") }));
app.get("script/:id", require("@endpoints/script"));
app.post("auth/", (req, res) => require("@endpoints/auth")(req, res, client));

app.listen(3000, () => console.log("Webserver started successfully."));

// log the bot into discord
client.login(token);

// error handling
client.on("commandError", (command, err) => console.log("Command Error", err, command));
process.on("unhandledRejection", (err, p) => console.log("Unhandled Rejection", err, p));
process.on("rejectionHandled", err => console.log("Rejection Handled", err));
process.on("uncaughtExceptionMonitor", err => console.log("Uncaught Exception Monitor", err));
process.on("warning", err => console.log("Warning", err));
