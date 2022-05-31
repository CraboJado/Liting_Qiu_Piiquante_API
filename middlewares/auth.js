const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.auth = { userId : decodedToken.data};
        //if frontend send req.body.userId , need to compare it with token, 
        // if frontend doesn't send req.body.userId , should handle the case of undefined
        if(req.body.userId && req.body.userId !== req.auth.userId || !req.body.userId) return res.status(403).json({ message: 'unauthorized request' })
        next();
      } catch( error ) {
        res.status(400).json({ error })
      }
    
}

module.exports = auth;