const app = require("./app.js");  

const PORT = process.env.PORT || 5050;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
