require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("../init/data");

const isProduction = process.env.NODE_ENV === "production";
const DB_URL = isProduction && process.env.ATLAS_DB
    ? process.env.ATLAS_DB
    : "mongodb://127.0.0.1:27017/bookBNB";

async function main() {
    await mongoose.connect(DB_URL);
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
    );

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "69d3af35213e9540c7beedbb",
        image: {
            url: obj.image,
            filename: "seed-image",
        },
    }));
    await Listing.insertMany(initData.data);
    console.log("Data inserted successfully");
};

initDB();