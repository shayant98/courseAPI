class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = this.status;
  }
}

module.exports = ErrorResponse;
