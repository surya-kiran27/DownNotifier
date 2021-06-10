const fs = require("fs");
const puppeteer = require("puppeteer");
const schedule = require("node-schedule");
const { Event } = require("../models");
const luxon = require("luxon");
const { sendBulk } = require("../utils/email");
async function checkState() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  let page = await browser.newPage();
  await page.goto("https://downdetector.com/archive/");

  await (await page.waitForSelector("#_evidon-banner-acceptbutton")).click();

  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll("table tr td a"));
    return tds.map((td) => {
      return { company: `${td.innerText}`, link: td.getAttribute("href") };
    });
  });
  let instagram = data.find((obj) => obj.company === "Instagram");
  console.log("instagram", instagram);
  if (instagram) {
    await page.goto(`https://downdetector.com/${instagram.link}`);
    await page.waitForSelector(".chartjs-render-monitor");
    const dataUrlChart = await page.evaluate(() => {
      const canvas = document.querySelector(".chartjs-render-monitor");
      return canvas.toDataURL();
    });

    let base64String = dataUrlChart.substr(dataUrlChart.indexOf(",") + 1); // get everything after the comma
    let imgBuffer = Buffer.from(base64String, "base64"); //
    fs.writeFileSync("image.png", imgBuffer);
    let published = await page.$eval(".date", (el) => el.innerText);
    published = published.split(": ")[1].trim();
    published = published.slice(0, -1);
    //text-justify
    let info = await page.$eval(".text-justify", (el) => el.innerText);
    info = info.split(".")[0];
    const eventDoc = await Event.findOne({}).sort({ createdAt: -1 });
    if (!eventDoc) {
      await Event.create({ status: info, originTime: published });
      await sendBulk({ info, published, image: imgBuffer });
    } else {
      const { createdAt, originTime } = eventDoc;
      const luxonCreatedAt = luxon.DateTime.fromJSDate(createdAt);
      const luxonCurrentTime = luxon.DateTime.fromISO(new Date().toISOString());
      const diff = luxonCurrentTime.diff(luxonCreatedAt, "hours").toObject();
      if (diff.hours > 24 && published !== originTime) {
        await Event.create({ status: info, originTime: published });
        await sendBulk({ info, published, image: imgBuffer });
        //send email
      }
    }
  }
  if (browser != null) await browser.close();
}

const job = schedule.scheduleJob(
  `*/${process.env.interval || 1} * * * *`,
  checkState
);

async function status() {
  const eventDoc = await Event.findOne(
    {},
    { _id: 0, createdAt: 0, __v: 0 }
  ).sort({ createdAt: -1 });
  return { status: true, data: eventDoc };
}

module.exports = { job, status };
