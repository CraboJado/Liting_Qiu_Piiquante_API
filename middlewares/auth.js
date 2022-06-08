const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        console.log('**************** in auth step****************');
        console.log('-----> request contente-type ',req.get('Content-Type'));

        // when authorization (token) is missing
        if(!req.headers.authorization){
          return res.status(401).json({error : 'unauthorized request, token missing'})
        }

        // when there is token
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.auth = { userId : decodedToken.data };
   
        /*
        when data format is application/json, we can access to req.body to get userId
        it runs to the authentication 
        */
        if(req.body.userId && req.body.userId !== req.auth.userId){
          return res.status(401).json({ error: 'unauthorized request, userId invalid vs token' })
        }

        /*
        when data format is multipart/form-data, the req.body is always empty {},because multer is not active at this step, 
        it runs to next() directly, and file will be uploaded in multer middleware
        so need to check the authentication again in controller middleware and delete uploaded file if user is unauthenticated
        */ 

        next();

      } catch( error ) {
        // when token is expired , when token is invalid 
        res.status(401).json({ error }) // QQ : le front freezz
      }
    
}

module.exports = auth;