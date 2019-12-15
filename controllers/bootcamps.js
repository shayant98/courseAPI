const path = require("path");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
/*
 * @desc Get all bootcamps
 * @route GET api/v1/bootcamps
 * @access Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
/*
 * @desc Get single bootcamp
 * @route GET api/v1/bootcamps/:id
 * @access Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id:${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});
/*
 * @desc Create bootcamp
 * @route POST api/v1/bootcamps
 * @access Private
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // add user to request body
  req.body.user = req.user.id;

  // Check if user has active bootcamps
  const hasPublishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if user is not admin, allow only one active bootcamp
  if (hasPublishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with id:${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    bootcamp: bootcamp
  });
});
/*
 * @desc Update bootcamp
 * @route PUT api/v1/bootcamps/:id
 * @access Private
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id:${req.params.id}`, 404));
  }

  // make sure user is owner of bootcamp (bootcamp user returns type of object id)
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    next(new ErrorResponse(`user ${req.user.id} is not authorized `, 401));
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

/*
 * @desc Delete bootcamp
 * @route DELETE api/v1/bootcamps/:id
 * @access Private
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id:${req.params.id}`, 404));
  }

  // make sure user is owner of bootcamp (bootcamp user returns type of object id)
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    next(new ErrorResponse(`user ${req.user.id} is not authorized `, 401));
  }

  bootcamp.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/*
 * @desc Get bootcamps within radius
 * @route GET api/v1/bootcamps/radius/:zipcode/:distance
 * @access Private
 */
exports.getBootcampsInRaduis = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // get LAT & LONG from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians --wiskunde shits

  // Divide distance by radius of earth
  // Earth radius = 3963 miles/ 6378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

/*
 * @desc Upload photo for bootcamp
 * @route PUT api/v1/bootcamps/:id/photo
 * @access Private
 */
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id:${req.params.id}`, 404)
    );
  }

  // make sure user is owner of bootcamp (bootcamp user returns type of object id)
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== admin) {
    next(new ErrorResponse(`user ${req.user.id} is not authorized `, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file `, 400));
  }

  const file = req.files.file;

  // check file type
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file `, 400));
  }
  if (!file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image les then ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
