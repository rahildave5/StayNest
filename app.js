const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");

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

app.listen(5050, () => {
    console.log("server is running on port");
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.send("server connected");
})

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

app.get("/listings", async(req, res) => {
    const allListings = await Listing.find({});
    console.log("working path");
    res.render("../views/listings/index.ejs", { allListings });
})