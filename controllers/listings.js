const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingsSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listings);
    newListing.owner = req.user._id;
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/");
    }
    res.render("listings/edit", { listing });
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/");
    }
    res.render("listings/show", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing || !listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing !");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id, req.body.listings);
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

//DELETE ROUTE
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing || !listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing !");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};

