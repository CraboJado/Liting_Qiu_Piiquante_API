const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
dotenv.config();

console.log(process.env.WINDOWMS);

// add rate limiter to login route
const limiter = rateLimit({
    windowMs: process.env.WINDOWMS, 
    max:3, // limit each Ip to 3 request per windowMs
    message: `You exceeded 3 requests in ${process.env.WINDOWMS} limit!`
})

module.exports = limiter