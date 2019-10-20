class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.statusCode = this.statusCode;
  }
}

module.exports = ErrorResponse;
