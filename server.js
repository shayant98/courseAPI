const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const connectDb = require("./config/db");
const path = require("path");

// Load ENV
dotenv.config({ path: "./config/config.env" });

//connect to DB
connectDb();

// ROUTE files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

// INIT server
const app = express();

// Body Parser
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//  file upload middleware
app.use(fileupload());

// set Static folder
app.use(express.static(path.join(__dirname, "public")));

// MOUNT router
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

app.use(errorHandler);

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
