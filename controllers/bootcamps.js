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
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort"];

  //loop over removeFields and delete from reqQuery
  removeFields.forEach(param => {
    delete reqQuery[param];
  });

  //Create queryStr
  let queryStr = JSON.stringify(reqQuery);

  //adding "$" to mongoDB operators
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = Bootcamp.find(JSON.parse(queryStr));

  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //sort fields
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query.sort("-createdAt");
  }

  // Query execution
  const bootcamps = await query;
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
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
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id:${req.params.id}`, 404));
  }

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
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id:${req.params.id}`, 404));
  }

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
