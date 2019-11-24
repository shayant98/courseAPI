const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

/*
 * @desc Get courses
 * @route GET api/v1/courses
 * @route GET api/v1/bootcamps/:bootcampId/courses
 * @access Public
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampId
    });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});

/*
 * @desc Get single course
 * @route GET api/v1/courses/:id
 * @access Public
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });

  if (!course) {
    return next(
      new ErrorResponse(`course not found with id:${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

/*
 * @desc Get single course
 * @route GET api/v1/courses/:id
 * @access Public
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });

  if (!course) {
    return next(
      new ErrorResponse(`course not found with id:${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

/*
 * @desc Create course
 * @route POST api/v1/bootcamps/:bootcampId/courses
 * @access Private
 */
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.body.bootcamp);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`no bootcamp with id:${req.body.bootcamp}`, 404)
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    course: course
  });
});

/*
 * @desc Update course
 * @route PUT api/v1/courses/:id/
 * @access Private
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`no course with id:${req.params.id}`, 404));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    success: true,
    course: course
  });
});

/*
 * @desc Delete course
 * @route PUT api/v1/courses/:id/
 * @access Private
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`no course with id:${req.params.id}`, 404));
  }

  await course.remove();

  res.status(201).json({
    success: true,
    course: {}
  });
});
