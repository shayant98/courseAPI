const path = require("path");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
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

  sendTokenResponse(user, 200, res);
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

  sendTokenResponse(user, 200, res);
});

/*
 * @desc Log user out & clear cookie
 * @route GET api/v1/auth/logout
 * @access Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/*
 * @desc Get current logged in user
 * @route POST api/v1/auth/me
 * @access Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

/*
 * @desc Update user details
 * @route PUT api/v1/auth/updatedeatils
 * @access Private
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

/*
 * @desc Update password
 * @route PUT api/v1/auth/updatepassword
 * @access Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    next(new ErrorResponse("password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/*
 * @desc Forfot password
 * @route POST api/v1/auth/forgotpassword
 * @access public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("No user found", 404));
  }

  // Get reset token
  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // create reseturl
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `Request a password change by sending a PUT request to the following URL \n \n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message
    });

    res.status(200).json({ success: true, data: "Email sent", user });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie & send response
const sendTokenResponse = (user, statusCode, res) => {
  token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token
    });
};
