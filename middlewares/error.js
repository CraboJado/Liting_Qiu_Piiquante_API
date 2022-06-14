const ErrorResponse = require('../utils/errorResponse');

//  we can do all of our error checking,error code checking,custom messages
const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message
    // in mongoose, 11000 means duplicate arrow key
    if(err.code === 11000) {
        const message = `Duplicate Field Value Enter`;
        error = new ErrorResponse(message,400);
    }
    // in mongoose a error called "ValidationError"
    if(err.name === "ValidationError") {
        // err.errors we pass all the "errors" filed of the objet : err
        // Object.values(err.errors) returns an array, we map it 
        const message = Object.values(err.errors).map( (val) => val.message);
        error = new ErrorResponse(message,400);
    }

    res.status(error.statusCode || 500).json({ error: error.message || "Server Error"})
}

module.exports = errorHandler;