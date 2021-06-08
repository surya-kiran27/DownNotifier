var crypto = require("crypto");
const { sendVerification } = require("../utils/email");
const { Subscription, Token, Attempt } = require("../models");

async function initVerification(params) {
  const { email } = params;
  if (!email) return { sucess: false, message: "Invalid" };

  const subscription = await Subscription.findOne({ email });
  if (!subscription) {
    return { sucess: false, message: "Please subscribe first!" };
  }
  if (subscription.verified)
    return { sucess: false, message: "Email already verified" };
  const token = crypto.randomBytes(30).toString("hex");
  await Token.create({ email, token, expiry: Date.now() + 20 * 60 * 1000 });
  const attemptDoc = await Attempt.findOne({ email });
  if (attemptDoc && attemptDoc.attempts > 5) {
    return { sucess: false, message: "max verification attempts exceeded" };
  }
  await Attempt.findOneAndUpdate(
    { email },
    { $inc: { attempts: 1 } },
    { upsert: true }
  );
  await sendVerification({ email, token });
  return {
    sucess: true,
    data: {},
  };
}

async function verifyEmail(params) {
  const { token } = params;
  if (!token) return { sucess: false, message: "Missing parameters" };

  const tokenDoc = await Token.findOne({ token });
  if (!tokenDoc) return { sucess: false, message: "Token invalid" };
  const currDate = new Date();
  if (currDate >= token.expiry) {
    return { sucess: false, message: "Token expired" };
  }
  if (tokenDoc.token !== token) {
    return { sucess: false, message: "Invalid token!" };
  }
  await Subscription.findOneAndUpdate(
    { email: tokenDoc.email },
    { $set: { verified: true } }
  );
  return {
    sucess: true,
    data: {},
  };
}

async function subscribe(params) {
  const { email, name } = params;
  if (!email || !name) return { sucess: false, message: "Missing parameters" };

  let subscription = await Subscription.findOne({ email });
  if (subscription)
    return {
      sucess: false,
      message: "Subscription already exists!",
      data: { subscription },
    };
  subscription = await Subscription.create({ email, name });
  await initVerification({ email });
  return {
    sucess: true,
    message: "",
    data: { subscription },
  };
}

module.exports = { initVerification, verifyEmail, subscribe };
