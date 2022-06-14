//  a blueprint for error response message
class ErrorResponse extends Error {
    constructor(message,statusCode) {
        // call super to set the message to actual error, we send it to message
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;