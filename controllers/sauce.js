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
        return res.status(400).json({error:'bad request, user must upload a file'})
    }

    const { userId } = JSON.parse(req.body.sauce);

    if(userId !== req.auth.userId){
        // need to unlink the file uploaded in server
        const imageFilePath = path.join(__dirname, `../${req.file.path}`); 
        fs.unlink(imageFilePath, ( error ) => {
            if (error) throw error; // est ce que ca plante le serveur
        })
        return res.status(401).json({error:' unauthorize request, userId missing or userId invalid vs Token'})
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
    .catch( error => res.status(500).json({ error }) )
 
}

exports.getSauce = (req, res, next) => {
    Sauce.findOne({ _id :req.params.id })
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
            return res.status(401).json({ error: 'unauthorized request without file, userId missing or invalid' })
        }
        // uploaded file by unauthenticated user, need to unlink from server
        const imageFilePath = path.join(__dirname, `../${req.file.path}`); 
        fs.unlink(imageFilePath, ( error ) => {
            if (error) throw error; // est ce que ca plante le serveur
            return res.status(401).json({error:' unauthorize request with file, userId missing or userId invalid vs Token'})
        });
        return   
    }

    // when runs here, user is authenticated to modify
    if(!req.file) {
        // Sauce.updateOne({ _id:req.params.id, userId:req.auth.userId },{ ...body }) , est ce que c'est mieux ?
        Sauce.updateOne({ _id:req.params.id},{ ...body })
            .then( () => res.status(201).json({ message:'sauce updated without file'}))
            .catch( error => res.status(500).json({ error }))
        return
    }
 // Sauce.findOneAndUpdate({ _id:req.params.id, userId:req.auth.userId },{ ...body },{ returnDocument :'before' })
    Sauce.findOneAndUpdate({ _id:req.params.id},{ ...body },{ returnDocument :'before' })
        .then( sauce => {
            const imageFilename = sauce.imageUrl.split('/images/')[1];
            const imageFilePath = path.join(__dirname, `../public/images/${imageFilename}`);
            fs.unlink(imageFilePath, error => {
                if (error) throw error; // est ce que ca plante le serveur ? sinon new Erroe() ? l'erreur pass par où?
                return res.status(201).json({ message:'sauce modified with updated file' })
            })
        })
        .catch( error => res.status(400).json( { error }) )
}

exports.deleteSauce = (req, res, next) => {
    console.log('************ in deleteSauce controller **************');
    console.log('----> id----', req.params.id);
    console.log('---> req.auth.userId',req.auth.userId)

    Sauce.findOneAndDelete({ _id:req.params.id,userId:req.auth.userId})
    .then( sauce => {
        console.log('--- sauce ----',sauce);
        console.log('----> sauce._id----', sauce._id);
        console.log('---> sauce.userId',sauce.userId)
        // if ( sauce === null) {
        //     // return res.status(401).json({ error:'requete non autorisé, userId invalid vs Token' })
        // }
        const imageFilename = sauce.imageUrl.split('/images/')[1];
        const imageFilePath = path.join(__dirname, `../public/images/${imageFilename}`);
        fs.unlink(imageFilePath, error => {
            if (error) throw error; // est ce que ca plante le serveur ?
            return res.status(201).json({ message:'sauce deleted and file deleted from server' })
        })
    })
    .catch( (error) => res.status(400).json({ error: 'bad request' + error }))


}

exports.likeSauce = (req, res, next) => {
    console.log('*********** in likeSauce controller ******')
    
    console.log('------->req.body----',req.body);
    const { like, userId } = req.body;

    Sauce.findOne({ _id : req.params.id })
    .then ( sauce => {
        if(!sauce) throw 'bad request, sauce can not find'

        if(like === 1) {
            console.log('------> Like',like);
            console.log('------> Sauce before change',sauce);
            const isLiked = sauce.usersLiked.find( element => element === userId);
            const isDisliked = sauce.usersDisliked.find( element => element === userId);

            if (!isDisliked && !isLiked) {
                sauce.likes++;
                sauce.usersLiked.push(userId);
                console.log('------> Sauce After change',sauce);
            }

            if (isLiked){
                throw 'you already Liked the sauce, you should cancle your like before disliking';
            }

            if (isDisliked){
                throw 'you already Disliked the sauce,you should cancle your dislike before liking';
            }
        }
    
        if(like === -1) {
            console.log('------> Like',like);
            console.log('------> Sauce before change',sauce);
            const isLiked = sauce.usersLiked.find( element => element === userId );
            const isDisliked = sauce.usersDisliked.find( element => element === userId );

            if(!isDisliked && !isLiked){
                sauce.dislikes++;
                sauce.usersDisliked.push(userId);
                console.log('------> Sauce After change',sauce);
            }

            if (isLiked){
                throw 'you already Liked the sauce, you should cancle your like before disliking';
            }

            if (isDisliked){
                throw 'you already Disliked the sauce,you should cancle your dislike before liking';
            }
        }
    
        if(like === 0) {
            console.log('------> Like',like);
            console.log('------> Sauce before change',sauce);
            const isLiked = sauce.usersLiked.find( element => element === userId);
            const isDisliked = sauce.usersDisliked.find( element => element === userId);

            if(isLiked && !isDisliked){
                sauce.likes = (sauce.likes === 0) ? 0 : --sauce.likes;
                sauce.usersLiked = sauce.usersLiked.filter( element => element !== userId);
                console.log('userId is in usersLiked array, user cancle like');
                console.log('------> Sauce After change',sauce);
                
            }

            if(isDisliked && !isLiked){
                sauce.dislikes = (sauce.dislikes === 0) ? 0 : --sauce.dislikes;
                sauce.usersDisliked = sauce.usersDisliked.filter( element => element !== userId);
                console.log('userId is in usersDislike array, user cancle dislike');
                console.log('------> Sauce After change',sauce);
            }

            if(!isLiked && !isDisliked){
                throw 'bad requst, you should like or dislike a sauce before cancling'
            }
        }

        return sauce
    })
    .then( sauce => {
        console.log('sauce return from uper then',sauce);
        console.log('like from uper then',like);
        const updateObj = {
            likes: sauce.likes,
            dislikes: sauce.dislikes,
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
        }
        Sauce.updateOne({_id : req.params.id},{...updateObj})
        .then(() => {
            if(like === 1) {
                res.status(201).json({ message:'you like sauce' })
            }
            if(like === -1) {
                res.status(201).json({ message:'you dislike sauce' })
            }
            if(like === 0) {
                res.status(201).json({ message:'your cancle is done' })
            } 
        })
        .catch( error => res.status(500).json({ errorupdateOne: error}))
    })
    .catch ( error => res.status(500).json({ errorFindOne : error}))
}

