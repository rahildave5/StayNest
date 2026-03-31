//REQUIRED PACKAGES
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingsSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const cookieParser = require("cookie-parser");
const connect = require("connect-flash");
const session = require("express-session");

//CONNECTING TO DB
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/bookBNB");
}
main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

//MIDDLEWARE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("thisisasecret"));

const sessionOptions = {
    secret:
        "thisisaverysecretstringthatshouldbereplacedwithsomethingelse",
    resave: false,
    saveUninitialized: true,
    cookies: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1 week
        maxAge: 1000 * 60 * 60 * 24 * 7, //1 week

    }
};


//ROUTES
app.get("/", (req, res) => {
    res.send("server connected");
});

//COOKIE TESTING ROUTE
app.get("/getsignedcookie", (req, res) => {
    res.cookie("made-in", "India", { signed: true });
    res.send("Signed cookie sent");
});

app.get("/verifycookie", (req, res) => {
    console.log(req.signedCookies);
    res.send("Check the console for cookies");
});

app.get("/getcookies", (req, res) => {
    res.cookie("made-in", "India");
    res.cookie("greet", "Namaste");
    res.send("Cookies sent");
});

//VALIDATION MIDDLEWARE
const validateListing = (req, res, next) => {
    const { error } = listingsSchema.validate(req.body);
    if (error) {
        let errorMessage = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errorMessage);
    }
    else {
        next();
    }
};

//VALIDATION MIDDLEWARE FOR REVIEWS
const validateReviews = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errorMessage = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errorMessage);
    }
    else {
        next();
    }
};


//TESTING ROUTE
app.get("/testing", wrapAync(async (req, res) => {
    let sampleListing = new Listing({
        title: "My new Villa",
        description: "By the woods, great sunny day and beautiful experience",
        price: 4000,
        location: "Panji, Goa",
        country: "India",
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful sending");
}));

//INDEX ROUTE
app.get("/listings", wrapAync(async (req, res) => {
    const allListings = await Listing.find({});
    console.log("working path");
    res.render("listings/index", { allListings });
}));

//NEW ROUTE
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

//EDIT ROUTE
app.get("/listings/:id/edit",
    wrapAync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit", { listing });
    }));

//SHOW ROUTE
app.get("/listings/:id", wrapAync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing });
}));

//CREATE ROUTE
app.post("/listings",
    validateListing,
    wrapAync(async (req, res, next) => {
        let { title, description, price, location, country } = req.body;
        const newListing = new Listing({
            title,
            description,
            price,
            location,
            country
        });
        await newListing.save();
        res.redirect("/listings");
    }));

//UPDATE ROUTE
app.put("/listings/:id",
    validateListing,
    wrapAync(async (req, res) => {
        let { id } = req.params;
        let { title, description, price, location, country } = req.body;
        await Listing.findByIdAndUpdate(id, {
            title,
            description,
            price,
            location,
            country
        });
        res.redirect(`/listings/${id}`);
    }));

//DELETE ROUTE
app.delete("/listings/:id", wrapAync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//DELETE REVIEWS ROUTE
app.delete("/listings/:listingId/reviews/:reviewId", wrapAync(async (req, res) => {
    let { listingId, reviewId } = req.params;
    await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${listingId}`);
}));

//FEEDBACK ROUTE
app.post("/listings/:id/feedback", validateReviews, wrapAync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("review added");
    res.redirect(`/listings/${req.params.id}`);
})
);

//EXPORT APP
module.exports = app;
