const express = require("express");
const router = express.Router({ mergeParams: true });
const loginRoutes = require("./login.js");
const User = require("../models/user.js");
const wrapAync = require("../utils/wrapAsync.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { signup, renderSignupForm } = require("../controllers/user.js");
const controllers = require("../controllers/user.js");
const { render } = require("ejs");

router.get
    ("/signup", renderSignupForm);

router.post("/signup", controllers.signup);




module.exports = router;