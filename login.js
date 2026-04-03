const express = require("express");
const router = express.Router({ mergeParams: true });
const loginRoutes = require("./login.js");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get
    ("/login", (req, res) => {
        res.render("users/login.ejs");
    });

router.post("/login", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(async (req, res) => {
    try {
        const { username, password } = req.body;
        const loginRoutes = new User({ username });
        const registeredUser = await loginRoutes.authenticate(password);
        req.flash("success", "Welcome to StayNest!");
        res.redirect("/listings");
    }
    catch (e) {
        req.flash("error", e.message);
        res.redirect("/login");
    }

}));

module.exports = router;
