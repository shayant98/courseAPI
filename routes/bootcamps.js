const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  deleteBootcamp,
  updateBootcamp,
  getBootcampsInRaduis,
  bootcampPhotoUpload
} = require("../controllers/bootcamps");

const { protect, authorize } = require("../middleware/auth");

const advancedResults = require("../middleware/advancedResults");
const Bootcamp = require("../models/Bootcamp");

// Include other resourse router
const courseRouter = require("./courses");

const router = express.Router();

// Re-route into outer resourse routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRaduis);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

module.exports = router;
