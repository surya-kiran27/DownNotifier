module.exports = {
  apps: [
    {
      name: "down-notifier-dev",
      script: "npm",
      args: "start",
      watch: "false",
      env: {
        NODE_ENV: "dev",
        domain: "https://143.110.179.210/down-notifier",
      },
    },
  ],
};
