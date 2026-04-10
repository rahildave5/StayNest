const { app, connectDB } = require("./app.js");

const port = 5050;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to start server due to DB error:", err.message);
        process.exit(1);
    });
