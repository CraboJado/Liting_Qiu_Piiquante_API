const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next)=>{
    console.log('----- in signup controller-----');
    const { email, password } = req.body;
    // check password vs regEx here ?
    // hash password
    bcrypt.hash(password,10)
        .then( hash => {
            const user = new User({
                            email,
                            password:hash
                        });
            // save user in database
            user.save()
            .then( () => res.status(201).json({ message: 'user created' }) )
            .catch( error => res.status(400).json({ error })); 
        })
        .catch( error => res.status(400).json({ error : error.message }));
}


exports.login = (req, res, next) => {
    console.log('----- in login controller-----');
    User.findOne({ email: req.body.email })
    .then( user => {
        // if user not exist, user = null
        if( !user ) return res.status(409).json({ error : 'user not exist' })
        
        // when user exist , then check password 
        bcrypt.compare(req.body.password,user.password)
        .then( result => {
            // when result is false
            if ( !result ) return res.status(401).json({ error : 'password invalid' });

            // when result is true, generate a token, send back to frontend
            const token = jwt.sign( { data: user._id }, process.env.TOKEN_SECRET, { expiresIn: '12h' });
            res.status(200).json({ userId: user._id, token })
        })
        .catch( error => res.status(400).json({ error : error.message }) ) 
    })
    .catch( error => res.status(500).json({ error }))

}

