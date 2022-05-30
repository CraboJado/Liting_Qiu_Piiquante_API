const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next)=>{

    bcrypt.hash(req.body.password,10)
        .then( hash => {
            const user = new UserModel({
              email:req.body.email,
              password:hash
            })
  
            user.save()
            .then( () => res.status(201).json({message: 'utilisateur créé'}) )
            .catch( error => res.status(400).json({ error }));
        })
        .catch( error => res.status(500).json({ error }))
        
}

exports.login = (req, res, next) => {

    UserModel.findOne({email:req.body.email})
    .then( user => {
        // if user not existe, user = null
        if( !user ) {
            res.status(400).json({message : 'utilisatuer n\'existe pas'})
            return
        }
        // when user exist , then check password 
        bcrypt.compare(req.body.password,user.password)
        .then( result => {
            // when result is false
            if ( !result ) {
                res.status(401).json({message : 'mot de pass incorrect'});
                return
            }
            // when result is true, generate un token, send back to frontend
            const token = jwt.sign( { data: user._id }, process.env.TOKEN_SECRET, { expiresIn: '24h' });
            res.status(200).json({ userId: user._id, token })
        })
        .catch( error => res.status(500).json({ error }) ) // dans 'les bonne pratiques', ne jamais envoyer ce code , donc, que fait ?

    })
    .catch( error => res.status(500).json({ error }))

}

