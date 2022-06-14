const jwt = require('jsonwebtoken');
const User = require('../models/user')

const auth = (req, res, next) => {
    // try {
    //     console.log('**************** in auth step****************');
    //     console.log('-----> request contente-type ',req.get('Content-Type'));
    //     console.log('-----> req.body in auth ',req.body);
    //     // console.log('-----> req.files in auth ',req.files);

    //     let token;

    //     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    //       token = req.headers.authorization.split(' ')[1];
    //     }

    //     if(!token) 
    //     return res.status(401).json({error : 'unauthorized request, token missing'});

    //     const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    //     req.auth = { userId : decodedToken.data };
   
    //     /*
    //     when data format is application/json, we can access to req.body to get userId
    //     it runs to the authentication 
    //     */
    //     if(req.body.userId && req.body.userId !== req.auth.userId){
    //       return res.status(401).json({ error: 'unauthorized request, userId invalid vs token' })
    //     }

    //     /*
    //     when data format is multipart/form-data, the req.body is always empty {},because multer is not active at this step, 
    //     it runs to next() directly, and file will be uploaded in multer middleware
    //     so need to check the authentication again in controller middleware and delete uploaded file if user is unauthenticated
    //     */ 

    //     next();

    //   } catch( error ) {
    //     // when token is expired , when token is invalid 
    //     res.status(401).json({ error }) // QQ : le front freezz
    //   }

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
  
        if(!token) throw new Error('unauthorized request, missing valid credentials ');
        // return res.status(401).json({error : 'unauthorized request, invalid credentials'});

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log('decodedToken.data',decodedToken.data);
        req.auth = { userId : decodedToken.data };

        User.findOne({ _id: decodedToken.data})
        .then( user =>{
            console.log('user',user);
            if(!user) throw new Error('unauthorized request, invalid credentials');
            next();
        })
        .catch( error => { res.status(401).json({ error:error.message }) })
        
      } catch (error) {
        res.status(401).json({ error:error.message })
      }


}

module.exports = auth;