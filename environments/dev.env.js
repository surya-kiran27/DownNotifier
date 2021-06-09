module.exports = {
  databases: {
    downNotifier: {
      dbName: "downNotifier",
      host: process.env.dbHost,
      port: "27017",
      username: process.env.dbUsername,
      password: process.env.dbPassword,
    },
  },
};
