const getCollection = require("@utils/getCollection");
const path = require("path");

module.exports = (req, res) => {
    let id = req.params.id;

    if (req.get("User-Agent") != "Roblox/WinInet" || !req.params.id) {
        return res.status(403).send("Invalid request.");
    };

    return getCollection("users", async (collection, _client) => {
        let _user = await collection.findOne({scriptID: id});

        if (!_user || !_user.whitelisted) {
            res.status(403).send("Invalid script ID, either doesn't exist or user is blacklisted.");
            return _client.close();
        };
        
        res.sendFile(path.resolve("./main/assets/script.lua"));
        
        return _client.close();
    });
};
