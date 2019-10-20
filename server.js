const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");

const connectDb = require("./config/db");

// Load ENV
dotenv.config({ path: "./config/config.env" });

//connect to DB
connectDb();

// ROUTE files
const bootcamps = require("./routes/bootcamps");

// INIT server
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// MOUNT router
app.use("/api/v1/bootcamps", bootcamps);

const port = process.env.PORT || 5000;

const server = app.listen(
  port,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port:${port}`.yellow.bold
  )
);

// Handle unhandled PROMISE rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // shutdown server
  server.close(() => {
    process.exit(1);
  });
});
