const express = require("express");
const router = express.Router({ mergeParams: true });
const loginRoutes = require("./login.js");
const User = require("../models/user.js");
const wrapAync = require("../utils/wrapAsync.js");
const wrapAsync = require("../utils/wrapAsync.js");


router.get
    ("/signup", (req, res) => {
        res.render("users/signup.ejs");
    });

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.flash("success", "Welcome to StayNest!");
        res.redirect("/listings");
    }
    catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }

}));




module.exports = router;