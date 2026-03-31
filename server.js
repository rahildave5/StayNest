const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const app = require("../app.js");
const connect = require("connect-flash");
const ExpressError = require("../utils/ExpressError.js");



app.use(session(sessionOptions));

app.get("/register", (req, res) => {
    let { name: anonymous } = req.query;
    req.session.username = name;
    req.flash("success", "Welcome to StayNest!");
    res.redirect("/welcome");
});

app.get("/welcome", (req, res) => {
    let { username } = req.session.name;
    res.send(`Welcome back, ${username}`);
});

app.get("/hello", (req, res) => {
    res.locals.message = req.flash("This message is from the server!");
    res.render({ name: "req.session.name" });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/welcome");
});

//ERROR HANDLING
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message } = err;
    res.status(statusCode).render("error.ejs", { errMessage: message });
});

app.listen(5050, () => {
    console.log("Server running on port 5050");
});