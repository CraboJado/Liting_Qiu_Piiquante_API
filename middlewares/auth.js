const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorResponse = require('../utils/errorResponse');

const auth = (req, res, next) => {
      console.log('**************** in auth step****************');
      console.log('-----> request contente-type ',req.get('Content-Type'));
      console.log('-----> req.headers.authorization ',req.headers.authorization);
      console.log('-----> req.body in auth ',req.body);
      console.log('-----> req.body.sauce in auth ',req.body.sauce);

      try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
          token = req.headers.authorization.split(' ')[1];
        }
  
        if(!token) {
          return next(new ErrorResponse("unauthorized request, missing valid credentials",401))
        }

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.auth = { userId : decodedToken.data };
        
      } catch (error) {
          next(error);
      }
}

module.exports = auth;