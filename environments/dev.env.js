module.exports = {
  databases: {
    downNotifier: {
      dbName: "downNotifier",
      host: "143.110.179.210",
      port: "27017",
      username: process.env.dbUsername,
      password: process.env.dbPassword,
    },
  },
};
