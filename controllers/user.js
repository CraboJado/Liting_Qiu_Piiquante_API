const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next)=>{
    console.log('----- in signup controller-----');
    console.log('----req.body-----', req.body);
    // bug : user can signup with invalid email like 333@hotmail or 333hotmail
    const { email, password } = req.body;
    const emailRegex = /^[0-9a-z._-\s]+[+0-9a-z._-]*@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}\s*$/; 
    if(!emailRegex.test(email)){
        return res.status(400).json({ error : 'bad request, format of email address invalid' })
    }
    // hash password
    bcrypt.hash(password,10)
        .then( hash => {
            const user = new User({
              email,
              password:hash
            })
            
            // save user in database
            user.save()
            .then( () => res.status(201).json({message: 'user created'}) )
            .catch( error => res.status(400).json({ error })); //QQ :status code 500 ?
        })
        .catch( error => res.status(500).json({ error })) //QQ :status code 500 ?   
}


exports.login = (req, res, next) => {
    console.log('----- in login controller-----');

    User.findOne({email:req.body.email})
    .then( user => {
        // if user not exist, user = null
        if( !user ) return res.status(400).json({message : 'user not exist'})
        
        // when user exist , then check password 
        bcrypt.compare(req.body.password,user.password)
        .then( result => {
            // when result is false
            if ( !result ) return res.status(401).json({message : 'password invalid'});

            // when result is true, generate un token, send back to frontend
            const token = jwt.sign( { data: user._id }, process.env.TOKEN_SECRET, { expiresIn: '12h' });
            res.status(200).json({ userId: user._id, token })
        })
        .catch( error => res.status(500).json({ error }) ) // QQ dans 'les bonne pratiques', ne jamais envoyer ce code , donc, que fait ?

    })
    .catch( error => res.status(500).json({ error }))

}

