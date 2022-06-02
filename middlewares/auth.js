const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

    try {
        // when token is missing
        if(!req.headers.authorization){
          return res.status(403).json({error : 'unauthorized, token missing'})
        }

        // when there is token
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.auth = { userId : decodedToken.data };
        console.log('auth ***************************req.body');
        console.log(req.body);
        console.log(req.file);
        console.log(req.body.sauce);

        // when multer before auth
        /*
         no matter file exists or not, need to JSON.parse(req.body.sauce)
        */
        //  const body = JSON.parse(req.body.sauce);
        // if( body.userId && body.userId !== req.auth.userId || !body.userId) return res.status(403).json({ message: 'unauthorized request' })
        
        // when auth before multer, in this case, i can't handle the case of undefined, otherwise, it will stop always at 'unauthorized request'
        // console.log(req.body.userId);
        // console.log(req);
        // console.log(req.body);
        if(req.body.userId && req.body.userId !== req.auth.userId || !req.body.userId ){
          return res.status(403).json({ message: 'unauthorized request' })
        }

        next();
      } catch( error ) {
        /*
        when no token , req.headers.authorization is undefined 
        when token is expired
        when token is invalid 
        */
        res.status(400).json({ errorAuth : error })
      }
    
}

module.exports = auth;