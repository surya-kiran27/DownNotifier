var express = require("express");
var router = express.Router();
const controllers = require("../controllers");

router.post("/", (req, res, next) => {
  controllers.user.subscribe(req.body).then((info) => {
    res.status(200).send(info);
  });
});

router.post("/resendVerificationEmail", (req, res, next) => {
  controllers.user.initVerification(req.body).then((info) => {
    res.status(200).send(info);
  });
});

router.get("/verifyEmail", (req, res, next) => {
  controllers.user.verifyEmail(req.query).then((info) => {
    res.status(200).send(info);
  });
});

module.exports = router;
