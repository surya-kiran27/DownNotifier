var crypto = require("crypto");
const { sendVerification } = require("../utils/email");
const { Subscription, Token, Attempt } = require("../models");

async function initVerification(params) {
  const { email } = params;
  if (!email) return { success: false, message: "Invalid" };

  const subscription = await Subscription.findOne({ email });
  if (!subscription) {
    return { success: false, message: "Please subscribe first!" };
  }
  if (subscription.verified)
    return { success: false, message: "Email already verified" };
  const token = crypto.randomBytes(30).toString("hex");
  await Token.create({ email, token, expiry: Date.now() + 20 * 60 * 1000 });
  const attemptDoc = await Attempt.findOne({ email }, {}, { lean: true });
  console.log("attemptDoc", attemptDoc);
  if (attemptDoc && attemptDoc.attempts > 5) {
    return {
      success: false,
      message: "max verification attempts exceeded",
      data: {},
    };
  }
  await Attempt.findOneAndUpdate(
    { email },
    { $inc: { attempts: 1 } },
    { upsert: true }
  );
  await sendVerification({ email, token });
  return {
    success: true,
    data: {},
  };
}

async function verifyEmail(params) {
  const { token } = params;
  if (!token) return { success: false, message: "Missing parameters" };

  const tokenDoc = await Token.findOne({ token });
  if (!tokenDoc) return { success: false, message: "Token invalid" };
  const currDate = new Date();
  if (currDate >= token.expiry) {
    return { success: false, message: "Token expired" };
  }
  if (tokenDoc.token !== token) {
    return { success: false, message: "Invalid token!" };
  }
  await Subscription.findOneAndUpdate(
    { email: tokenDoc.email },
    { $set: { verified: true } }
  );
  return {
    success: true,
    data: {},
  };
}

async function subscribe(params) {
  const { email, name } = params;
  if (!email) return { success: false, message: "Missing parameters" };

  let subscription = await Subscription.findOne({ email });
  if (subscription)
    return {
      success: true,
      message: "",
      data: { subscription },
    };
  subscription = await Subscription.create({ email, name });
  await initVerification({ email });
  return {
    success: true,
    message: "",
    data: { subscription },
  };
}

module.exports = { initVerification, verifyEmail, subscribe };
