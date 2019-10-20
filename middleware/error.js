const errorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // log to consoloe for dev
  console.log(err);

  //   mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Bootcamp not found with id:${err.value}`;
    error = new errorResponse(message, 404);
  }

  //   Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new errorResponse(message, 400);
  }

  //   Mongoose validation err
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message);
    error = new errorResponse(message, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error"
  });
};

module.exports = errorHandler;
