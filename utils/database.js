const mongoose = require("mongoose");

const { databases } = global.config;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

const connections = {};

async function connectdb(reqDb) {
  // eslint-disable-next-line consistent-return
  return new Promise((resolve, reject) => {
    if (Object.prototype.hasOwnProperty.call(connections, "reqDb")) {
      return resolve(connections[reqDb]);
    }
    const dbConfig = databases[reqDb];
    // const dbOptions = AvailableDbs[dbNameOpt];
    const { username, password, host, port, dbName } = dbConfig;
    mongoose.connect(
      `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=admin`,
      options,
      (err, client) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        console.log(`${reqDb} connected`);
        connections[reqDb] = client;
        return resolve(client);
      }
    );
  });
}

module.exports = { connectdb };
