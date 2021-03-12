const { hmac_key } = process.env;
const getCollection = require("@utils/getCollection");
const crypto = require("crypto");
const createEmbed = require("@utils/createEmbed");

module.exports = (req, res, client) => {
    if (!req.get("User-Agent").includes("synx")) {
        return res.status(403).send("Invalid request.");
    };

    let hwid = req.headers["syn-fingerprint"];
    let ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || req.connection.remoteAddress;
    
    let signature = Buffer.from(req.body[crypto.createHmac("sha3-256", hmac_key).update("Signature").digest("hex")], "base64").toString("utf8");
    let key = Buffer.from(req.body[crypto.createHmac("sha3-256", signature + "DM Spencer#0003 for free VBucks" + hmac_key).update("Key").digest("hex")], "base64").toString("utf8");
    let scriptID = Buffer.from(req.body[crypto.createHmac("sha3-256", hmac_key + signature + "https://tenor.com/view/doing-ur-mom-gif-18200972").update("ScriptID").digest("hex")], "base64").toString("utf8");
    let auth = Buffer.from(req.body[crypto.createHmac("sha3-256", signature + "Doing your mom" + hmac_key).update("Auth").digest("hex")], "base64").toString("utf8");
    let robloxUsername = Buffer.from(req.body[crypto.createHmac("sha3-256", signature + "Roblox Name" + hmac_key).update("Auth").digest("hex")], "base64").toString("utf8");
    let status = "Valid";

    if (!key || !scriptID || !auth || !signature || !hwid || !ip) {
        res.status(403).json({ success: false });
    };

    return getCollection("users", async (collection, _client) => {
        let _user = await collection.findOne({scriptID: scriptID});

        if (!_user) {
            client.channels.cache.get("813518453473673246").send(createEmbed({
                title: "Unsuccessful Login - Invalid Script ID",
                message: [
                    { name: "Hashed Key", value: key },
                    { name: "HWID", value: hwid },
                    { name: "IP Address", value: ip }
                ],
                colour: 0xFF0000
            }));
            res.json({ success: false, body: Buffer.from("Invalid Script ID").toString("base64") });
            return _client.close();
        };
        
        if (!_user.whitelisted) {
            status = "Invalid";
        };

        if (_user.hwid == "") {
            await collection.updateOne(_user, { $set: { hwid: hwid } });
        };

        if (hwid != _user.hwid) {
            status = "Mismatch";
        };

        let accounts = _user.robloxAccounts;
        if (!accounts.includes(robloxUsername)) {
            accounts.push(robloxUsername);
            await collection.updateOne(_user, { $set: { robloxAccounts: accounts } })
        };

        if (crypto.createHmac("sha3-256", hmac_key + signature).update("ICEE plays Fortnite.").digest("hex") != auth || crypto.createHmac("sha3-256", signature).update(_user.key).digest("hex") != key) {
            status = "Invalid";
        };

        let member = client.users.cache.get(_user.id);
        switch(status) {
            case "Valid":
                client.channels.cache.get("813518435346153482").send(createEmbed({
                    title: "Successful Login",
                    message: [
                        { name: "User", value: member.tag },
                        { name: "Discord ID", value: _user.id },
                        { name: "Key", value: _user.key },
                        { name: "HWID", value: hwid },
                        { name: "IP Address", value: ip },
                        { name: "Script ID", value: scriptID },
                        { name: "Roblox Username", value: robloxUsername }
                    ]
                }));
                res.json({ success: true, body: Buffer.from(crypto.createHmac("sha3-256", hmac_key + signature).update(scriptID + "Valid").digest("hex")).toString("base64") });
                break;
            case "Invalid":
                client.channels.cache.get("813518453473673246").send(createEmbed({
                    title: "Unsuccessful Login - Invalid Key",
                    message: [
                        { name: "User", value: member.tag },
                        { name: "Discord ID", value: _user.id },
                        { name: "Expected Key", value: _user.key },
                        { name: "Hashed Key", value: key },
                        { name: "HWID", value: hwid },
                        { name: "IP Address", value: ip },
                        { name: "Roblox Username", value: robloxUsername }
                    ],
                    colour: 0xFF0000
                }));
                res.json({ success: false, body: Buffer.from("Invalid Key").toString("base64") });
                break;
            case "Mismatch":
                client.channels.cache.get("813518490077757450").send(createEmbed({
                    title: "HWID Mismatch",
                    message: [
                        { name: "User", value: member.tag },
                        { name: "Discord ID", value: _user.id },
                        { name: "Key", value: _user.key },
                        { name: "HWID", value: hwid },
                        { name: "Expected HWID", value: _user.hwid },
                        { name: "IP Address", value: ip },
                        { name: "Script ID", value: scriptID },
                        { name: "Roblox Username", value: robloxUsername }
                    ],
                    colour: 0xFF0000
                }));
                res.json({ success: false, body: Buffer.from("Mismatch").toString("base64") })
                break;
        };
        
        return _client.close();
    });
};
