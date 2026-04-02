//REQUIRED PACKAGES
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingsSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");
const signupRoutes = require("./models/signup.js");
const loginRoutes = require("./models/login.js");

//CONNECTING TO DB
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/bookBNB");
}
main()
    .then(() => console.log("connected to DB"))
    .catch((err) => console.log(err));

//MIDDLEWARE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// SESSION — must come BEFORE flash()
const sessionOptions = {
    secret: "thisisaverysecretstringthatshouldbereplacedwithsomethingelse",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};
app.use(session(sessionOptions));

// FLASH — must come AFTER session()
app.use(flash());

// PASSPORT CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


// Make flash messages available in every EJS template
app.use((req, res, next) => {
    res.locals.success = req.flash("success") || [];
    res.locals.error = req.flash("error") || [];
    next();
});

app.use("/", signupRoutes);
app.use("/", loginRoutes);

// // DEMO USER ROUTE
// app.get("/demo_user", async (req, res) => {
//     let demoUser = new user({ username: "demo_user", email: "demo@example.com" });
//     const registeredUser = await user.register(demoUser, "helloworld");
//     res.send(registeredUser);
// });

//VALIDATION MIDDLEWARE
const validateListing = (req, res, next) => {
    const { error } = listingsSchema.validate(req.body);
    if (error) {
        let errorMessage = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errorMessage);
    } else {
        next();
    }
};

const validateReviews = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errorMessage = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errorMessage);
    } else {
        next();
    }
};

//ROUTES
app.get("/", (req, res) => {
    res.redirect("/listings");
});

//INDEX ROUTE
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

//NEW ROUTE
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

//CREATE ROUTE
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listings);
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
}));

//EDIT ROUTE
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/");
    }
    res.render("listings/edit", { listing });
}));

//SHOW ROUTE
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/");
    }
    res.render("listings/show", { listing });
}));

//UPDATE ROUTE
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listings);
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}));

//DELETE REVIEWS ROUTE
app.delete("/listings/:listingId/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { listingId, reviewId } = req.params;
    await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${listingId}`);
}));

//FEEDBACK ROUTE
app.post("/listings/:id/feedback", validateReviews, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${req.params.id}`);
}));

module.exports = { app, validateListing, validateReviews };
