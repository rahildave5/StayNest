const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const controllers = require("../controllers/user.js");
const { renderLoginForm } = require("../controllers/user.js");

router.route("/login")
    .get(renderLoginForm)
    .post(saveRedirectUrl,

        passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
        controllers.login);


module.exports = router;