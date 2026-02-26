//REQUIRED PACKAGES
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

//CONNECTING TO DB
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/bookBNB   ")
}
main()
    .then(
        () => {
            console.log("connected to DB");
        })
    .catch(
        (err) => {
            console.log(err);
        }
    )

//SEEDING THE DB
app.listen(5050, () => {
    console.log("server is running on port");
})

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
})

//TESTING ROUTE to check if the connection to DB is working and if we can save a sample listing to the DB
app.get("/testing", async(req, res) => {
    let sampleListing = new Listing(
        {
        title: "My new Villa",
        description: "By the woods, great sunny day and beautiful expierence",
        price: 4000,
        location: "Panji, Goa",
        country: "India",
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("succesful sending");
});

//INDEX ROUTE
app.get("/listings", async(req, res) => {
    const allListings = await Listing.find({});
    console.log("working path");
    res.render("../views/listings/index.ejs", { allListings });
})

//NEW ROUTE
app.get("/listings/new", (req, res) => {
    res.render("../views/listings/new.ejs");
});

//SHOW ROUTE
app.get("/listings/:id", async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("../views/listings/show.ejs", { listing });
});

//CREATE ROUTE
app.post("/listings", async(req, res) => {
    let {title, description, price, location, country} = req.body;
    const newListing = new Listing({
        title,
        description,
        price,
        location,
        country
    });
    await newListing.save();
    res.redirect("/listings");
});

//EDIT ROUTE
app.get("/listings/:id/edit", async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("../views/listings/edit.ejs", { listing });
});

//UPDATE ROUTE
app.put("/listings/:id", async(req, res) => {
    let { id } = req.params;
    let {title, description, price, location, country} = req.body;
    await Listing.findByIdAndUpdate(id, {
        title,
        description,      
        price,
        location,
        country
    });
    res.redirect(`/listings/${id}`);
});

//DELETE ROUTE
app.delete("/listings/:id", async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})
