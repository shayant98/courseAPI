const express = require("express");
const dotenv = require("dotenv");

// Load ENV
dotenv.config({ path: "./config/config.env" });

// INIT server
const app = express();

const port = process.env.PORT || 5000;

app.listen(
  port,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port:${port}`)
);
