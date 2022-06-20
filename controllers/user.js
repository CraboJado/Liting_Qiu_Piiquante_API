const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

exports.signup = (req, res, next)=>{
    const { email, password } = req.body;
    // hash password
    bcrypt.hash(password,10)
        .then( hash => {
            const user = new User({
                        email,
                        password:hash
                    });
            user.save()
            .then( () => res.status(201).json({ message: 'user created' }) )
            .catch( error => next(error) ); 
        })
        .catch( error => next(error) );
}


exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then( user => {
        if( !user ) return next(new ErrorResponse('user does not exist',404));
        // when user exist , then check password 
        bcrypt.compare(req.body.password,user.password)
        .then( result => {
            if ( !result ) return next(new ErrorResponse('password invalid',401));
            const token = jwt.sign( 
                            { data: user._id }, 
                            process.env.TOKEN_SECRET, 
                            { expiresIn: process.env.TOKEN_EXPIRE }
                            );
            res.status(200).json({ userId: user._id, token })
        })
        .catch( error => next(error) ) 
    })
    .catch( error => next(error) )
}

