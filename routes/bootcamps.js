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

// Include other resourse router
const courseRouter = require("./courses");

const router = express.Router();

// Re-route into outer resourse routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRaduis);

router
  .route("/")
  .get(getBootcamps)
  .post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route("/:id/photo").put(bootcampPhotoUpload);

module.exports = router;
