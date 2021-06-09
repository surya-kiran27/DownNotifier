/* eslint-disable import/no-dynamic-require */
const env = process.env.NODE_ENV || "local";
console.log("environment : ", env);
global.env = env;
global.isDev = ["dev"].indexOf(env) !== -1;

const environmentVars = require(`../environments/${env}.env`);

module.exports = { ...environmentVars };
