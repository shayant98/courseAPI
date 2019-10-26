const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotEnv = require("dotenv");

//load env
dotEnv.config({ path: "./config/config.env" });

// Load modals
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

// connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);

    console.log("done seeding".green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

// Delete data from db
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany(); //will delete everything if nothing passed
    await Course.deleteMany();

    console.log("done removed".red.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

if (process.argv[2] === "-i" || process.argv[2] === "import") {
  //"node seeder -i" in console
  importData();
} else if (process.argv[2] === "-d" || process.argv[2] === "delete") {
  //"node seeder -d" in console
  deleteData();
}
