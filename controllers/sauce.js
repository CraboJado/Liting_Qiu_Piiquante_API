const Sauce = require('../models/sauce');
const fs = require('fs');
const path = require('path');


exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then( sauces => res.status(200).json(sauces) )
        .catch( error => res.status(500).json({ error }) )

}

exports.createSauce = (req, res, next) => {
    console.log('***** in createSauce controller ******');

    if(!req.file) {
        return res.status(400).json({error:'bad request, must upload a file'})
    }

    const userIdFromRequest = JSON.parse(req.body.sauce).userId

    if(userIdFromRequest !== req.auth.userId){
        // need to unlink the file uploaded 
        const imageFilePath = path.join(__dirname, `../${req.file.path}`); 
        fs.unlink(imageFilePath, ( error ) => {
            if (error) throw error; // est ce que ca plante le serveur
        })
        return res.status(403).json({error:' unauthorize request, userId missing or userId invalid vs Token'})
    }
   
    const sauce = new Sauce ({
        ...JSON.parse(req.body.sauce),
        imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked : [],
        usersDisliked : [],
    })
    sauce.save()
    .then(() => res.status(201).json({ response:' sauce created ' }))
    .catch( error => res.status(500).json({ error : error }) )
 
}

exports.getSauce = (req, res, next) => {
    Sauce.findOne({_id :req.params.id })
        .then( sauce => res.status(200).json( sauce ))
        .catch( error => res.status(400).json( { error }) ) // pourquoi pas 500 ?
}

exports.modifySauce = (req, res, next) => {
    console.log('************ in modifySauce controller **************');
    const body = req.file ? {
        ...JSON.parse(req.body.sauce), 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : req.body ;

    if(body.userId !== req.auth.userId) {
        if(!req.file) {
            return res.status(403).json({ error: 'unauthorized request without file, userId missing or invalid' })
        }
        // uploaded file by unauthenticated user, need to unlink from server
        const imageFilePath = path.join(__dirname, `../${req.file.path}`); 
        fs.unlink(imageFilePath, ( error ) => {
            if (error) throw error; // est ce que ca plante le serveur
            return res.status(403).json({error:' unauthorize request with file, userId missing or userId invalid vs Token'})
        });
        return   
    }

    // when runs here, user is authenticated to modify
    if(!req.file) {
        Sauce.updateOne({ _id:req.params.id },{ ...body })
            .then( () => res.status(201).json({ message:'sauce updated without file'}))
            .catch( error => res.status(500).json({ error }))
        return
    }

    Sauce.findOneAndUpdate({ _id:req.params.id },{ ...body },{ returnDocument :'before' })
        .then( sauce => {
            const imageFilename = sauce.imageUrl.split('/images/')[1];
            const imageFilePath = path.join(__dirname, `../public/images/${imageFilename}`);
            fs.unlink(imageFilePath, error => {
                if (error) throw error; // est ce que ca plante le serveur ?
                return res.status(201).json({ message:'sauce modified with updated file' })
            })
        })
        .catch( error => res.status(400).json( { error }) )
}

exports.deleteSauce = (req, res, next) => {
    res.status(200).json({ message:'sauce deleted' })
}