const express = require("express");
const app = express();
const port = 5000;


// Routing
app.get("/", (req, res) => {});


// Create server
app.listen(port, (err) => {
    if (err)
        throw err
    else
        console.log("Server is running at port %d:", port);
});
