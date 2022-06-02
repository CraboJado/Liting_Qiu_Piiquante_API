const Sauce = require('../models/sauce');
const fs = require('fs');
const path = require('path');


exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then( sauces => { 
            res.status(200).json( sauces ) })
        .catch( error => res.status(500).json({ error }) )

}

exports.createSauce = (req,res,next) => {

    const sauce = new Sauce ({
        // when loading file, the data form changes to JSON, need to parse into basic JS objet
        ...JSON.parse(req.body.sauce),
 
        imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked : [],
        usersDisliked : [],
    })
    sauce.save()
    .then(( sauce ) => {
        // console.log(sauce);
        res.status(201).json({response:'  sauces created'})
    })
    .catch( error => res.status(500).json({ error }) )

}

exports.getSauce = (req, res, next) => {
    Sauce.findOne({_id :req.params.id })
        .then( sauce => res.status(200).json( sauce ))
        .catch( error => res.status(400).json( { error }) )
}

exports.modifySauce = (req, res, next) => {

    const body = req.file ? {
        ...JSON.parse(req.body.sauce), 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : JSON.parse(req.body.sauce) ;

    Sauce.findOneAndUpdate({ _id:req.params.id },{ ...body },{ returnDocument :'before' })
    .then( (sauce) => {

        if(!req.file) {
            res.status(200).json({message:'sauce modified'})
            return 
        }

        const imageFilename = sauce.imageUrl.split('/images/')[1];
        const imageFilePath = path.join(__dirname, `../public/images/${imageFilename}`);
        fs.unlink(imageFilePath, ( error ) => {
            if (error) throw error;
            res.status(200).json({message:'sauce modified'})
        })

    })
    .catch(error => res.status(400).json( { errorfU: error }) )

}

exports.deleteSauce = (req, res, next) => {
    res.status(200).json({ message:'sauce deleted' })
}