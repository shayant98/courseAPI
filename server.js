const express = require("express");
const dotenv = require("dotenv");

// Load ENV
dotenv.config({ path: "./config/config.env" });

// ROUTE files
const bootcamps = require("./routes/bootcamps");

// INIT server
const app = express();

// MOUNT router

app.use("/api/v1/bootcamps", bootcamps);

const port = process.env.PORT || 5000;

app.listen(
  port,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port:${port}`)
);
