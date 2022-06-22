class ErrorResponse extends Error {
    constructor(message,statusCode) {
        // call super to call the parent constructor
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;