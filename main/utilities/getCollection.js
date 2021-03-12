const { mongo_url } = process.env;

const { MongoClient } = require("mongodb");

module.exports = (coll, callback) => {
    MongoClient.connect(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;
        
        callback(client.db("hydra").collection(coll), client);
    });
};
