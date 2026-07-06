const { app, connectDB } = require("../app.js");

let dbConnected = false;

module.exports = async (req, res) => {
    if (!dbConnected) {
        await connectDB();
        dbConnected = true;
    }
    return app(req, res);
};
