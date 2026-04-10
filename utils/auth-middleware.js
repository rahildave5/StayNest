const Review = require("../models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.path, "..", req.originalUrl);
    if (!req.isAuthenticated()) {
        if (req.method === "GET") {
            req.session.redirectUrl = req.originalUrl;
        } else {
            req.session.redirectUrl = req.get("referer") || "/listings";
        }
        req.flash("error", "You must be logged in to do that!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    } next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { listingId, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${listingId}`);
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${listingId}`);
    }

    next();
};
