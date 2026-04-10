//REQUIRED PACKAGES
require('dotenv').config();
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
const { isLoggedIn, isReviewAuthor } = require("./utils/auth-middleware.js");
const listingController = require("./controllers/listings.js");
const reviewController = require("./controllers/review.js");
const { createReview, deleteReview } = require("./controllers/review.js");
const controllers = require("./controllers/user.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const connectMongo = require("connect-mongo");
const mongoStore = connectMongo.default || connectMongo.MongoStore || connectMongo;
const mongoose = require("mongoose");

//CONNECTING TO DB
const LOCAL_DB_URL = "mongodb://127.0.0.1:27017/bookBNB";
const ATLAS_DB_URL = process.env.ATLAS_DB;

async function connectDB() {
    const primaryDbUrl = ATLAS_DB_URL;
    try {
        await mongoose.connect(primaryDbUrl, { serverSelectionTimeoutMS: 5000 });
        console.log("connected to DB");
    } catch (err) {
        if (!ATLAS_DB_URL) throw err;
        console.warn("Atlas DB connection failed, trying local MongoDB...");
        await mongoose.connect(LOCAL_DB_URL, { serverSelectionTimeoutMS: 5000 });
        console.log("connected to local DB");
    }
}

//MIDDLEWARE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const store = mongoStore.create({
    mongoUrl: ATLAS_DB_URL || LOCAL_DB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600 // time period in seconds
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

// SESSION — must come BEFORE flash()
const sessionOptions = {
    secret: process.env.SECRET,
    store,
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
    res.locals.currentUser = req.user;
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
    req.body.review = req.body.review || {};
    if (req.user && req.user.username) {
        req.body.review.username = req.user.username;
    }
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
app.get("/listings", wrapAsync(listingController.index));

//NEW ROUTE
app.get("/listings/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//CREATE ROUTE
app.post("/listings", isLoggedIn, upload.single("image"), validateListing, wrapAsync(listingController.createListing));

//EDIT ROUTE
app.get("/listings/:id/edit", isLoggedIn, wrapAsync(listingController.editListing));

//SHOW ROUTE
app.get("/listings/:id", wrapAsync(listingController.showListing));

// Prevent direct/cached GET requests to feedback endpoint.
app.get("/listings/:id/feedback", isLoggedIn, (req, res) => {
    req.flash("error", "Please submit feedback using the form.");
    res.redirect(`/listings/${req.params.id}`);
});

//UPDATE ROUTE
app.put("/listings/:id", isLoggedIn, validateListing, wrapAsync(listingController.updateListing));

//FEEDBACK ROUTE
app.post("/listings/:id/feedback", isLoggedIn, validateReviews, wrapAsync(reviewController.createReview));

//DELETE REVIEWS ROUTE
app.delete("/listings/:listingId/reviews/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

//LOGOUT ROUTE
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = { app, validateListing, validateReviews, connectDB };
