"use strict";
const express = require("express");
const cors = require("cors");
const db = require("./db"); // import db.js
const app = express();
app.use(cors());
app.use(express.json());
// Optional: test DB connection before starting server
db.connect()
    .then(() => {
    console.log("Connected to PostgreSQL");
    app.listen(3000, () => {
        console.log("Server up and running on http://localhost:3000");
    });
})
    .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1); // exit if DB connection fails
});
