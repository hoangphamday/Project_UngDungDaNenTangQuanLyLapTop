class LoiUngDung extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = 'LoiUngDung';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = LoiUngDung;
