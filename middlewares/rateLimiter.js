const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: process.env.WINDOWMS, 
    max:3, // limit each Ip to 3 request per windowMs
    message: `You exceeded 3 requests in ${process.env.WINDOWMS} limit!`
})

module.exports = limiter