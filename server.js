const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");
const connectDb = require("./config/db");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");

// Load ENV
dotenv.config({ path: "./config/config.env" });

//connect to DB
connectDb();

// ROUTE files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const user = require("./routes/users");

// INIT server
const app = express();

// Body Parser
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//  file upload middleware
app.use(fileupload());
app.use(cookieParser());
app.use(mongoSanitize());

// Set securty headers
app.use(helmet());

// prevent xss
app.use(xss());

// prevent hpp
app.use(hpp());

// cors setup
app.use(cors());

// express rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 100,
  max: 100
});

app.use(limiter);
// set Static folder
app.use(express.static(path.join(__dirname, "public")));

// MOUNT router
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", user);

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
