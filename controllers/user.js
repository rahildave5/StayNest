const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");


//SIGNUP CONTROLLERS
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to StayNest!");
            res.redirect("/listings");
        });
    }
    catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

//LOGIN CONTROLLERS
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}
    ;
module.exports.login = (req, res) => {
    req.flash("success", "Welcome to StayNest!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};  