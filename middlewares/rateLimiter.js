const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: process.env.WINDOWMS, 
    max:process.env.MAX, // limit each Ip to MAX request per windowMs
    message: `You exceeded 3 requests in ${process.env.WINDOWMS} limit!`
})

module.exports = limiter