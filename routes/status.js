var express = require("express");
var router = express.Router();
let controllers = require("../controllers");

router.get("/", (req, res, next) => {
  controllers.scraper.status().then((info) => {
    res.status(200).send(info);
  });
});

module.exports = router;
