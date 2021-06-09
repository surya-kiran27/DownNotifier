let api_key = process.env.MAILGUN;
let domain = "mail.doctorjarvee.com";
let mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });
const { Subscription } = require("../models");

async function sendBulk({ published, info, image }) {
  const subscriptions = await Subscription.find(
    { verified: true },
    {},
    { lean: true }
  );
  const recipients = subscriptions.map((subscription) => subscription.email);
  const attach = new mailgun.Attachment({
    data: image,
    filename: "image.png",
  });

  const envelope = {
    from: `notifier@${domain}`,
    to: recipients,
    subject: "Alert from Instagram Down Notifier",
    html: `<h1>Alert!!!</h1> <h2>${info}<h2><br></br><h3>published At ${published}</h3>`,
    attachment: attach,
  };

  mailgun.messages().send(envelope, function (error, body) {
    console.log(body);
  });
}

async function sendVerification({ email, token }) {
  let envelope = {
    from: `notifier@${domain}`,
    to: email,
    subject: "Down Notifier please verify your email",
    html: `Hi, Please verify email by clicking the following link <a href=${process.env.domain}/user/verifyEmail?token=${token}>Click here</a>  Note:Link will expire in 20minutes`,
  };

  mailgun.messages().send(envelope, function (error, body) {
    console.log("error", error);
    if (error) return Promise.reject(error);
    console.log("body", body);
    return Promise.resolve(body);
  });
}

module.exports = { sendBulk, sendVerification };
