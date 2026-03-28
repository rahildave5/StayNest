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
const { listingsSchema } = require("./schema.js");
const Review = require("./models/review.js");

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

//ROUTES
app.get("/", (req, res) => {
    res.send("server connected");
});

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
    const listing = await Listing.findById(id);
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

//FEEDBACK ROUTE
app.post("/listings/:id/feedback", async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("review added");
    res.send("review added");
});


//ERROR HANDLING
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode, message } = err;
    res.render("error.ejs", { errMessage: message });
    // res.status(statusCode).send(message);
});

//START SERVER
app.listen(5050, () => {
    console.log("server is running on port 5050");
});
