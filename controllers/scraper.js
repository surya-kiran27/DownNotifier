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
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process", // <- this one doesn't works in Windows
      "--disable-gpu",
    ],
  });
  try {
    let page = await browser.newPage();
    await page.goto("https://downdetector.com/status/instagram/archive/");
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
      await page.goto(`https://downdetector.com${instagram.link}`);
      await page.waitForSelector(".chartjs-render-monitor");
      const dataUrlChart = await page.evaluate(() => {
        const canvas = document.querySelector("#holder");
        return canvas.toDataURL();
      });

      let base64String = dataUrlChart.substr(dataUrlChart.indexOf(",") + 1); // get everything after the comma
      let imgBuffer = Buffer.from(base64String, "base64"); //
      let published = await page.$eval(".date", (el) => el.innerText);
      published = published.split(": ")[1].trim();
      published = published.slice(0, -1);
      //text-justify
      let info = await page.$eval(".text-justify", (el) => el.innerText);
      info = info.split(".")[0];
      const eventDoc = await Event.findOne({ originTime: published });
      console.log("published", published, "eventDoc", eventDoc);
      if (!eventDoc) {
        await Event.create({ status: info, originTime: published });
        await sendBulk({ info, published, image: imgBuffer });
      }
    }
    if (browser != null) await browser.close();
  } catch (error) {
    if (browser != null) await browser.close();
    console.log("error", error);
  }
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
