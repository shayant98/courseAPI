const path = require("path");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

/*
 * @desc Register user
 * @route POST api/v1/auth/register
 * @access Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //   create User
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  //Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  });
});

/*
 * @desc Login user
 * @route POST api/v1/auth/login
 * @access Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //   validate email & password
  if (!email) {
    return next(new ErrorResponse(`Please add an email`, 400));
  }
  if (!password) {
    return next(new ErrorResponse(`Please add an password`, 400));
  }

  //   check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse(`invalid credentials`, 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`invalid credentials`, 401));
  }

  token = user.getSignedJwtToken();
  res.status(200).json({
    success: true,
    token
  });
});
