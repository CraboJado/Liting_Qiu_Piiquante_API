const Sauce = require('../models/sauce');
const fs = require('fs');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');


const getFilePath = (filename) => {
    return path.join(__dirname, `../public/images/${filename}`);
}

const unlinkFile = (file,next) => {
    fs.unlink(file, err => {
        if(err) next(err);
    })
}


const likeHandler = (body, sauce) => {
    const isLiked = sauce.usersLiked.find( element => element === body.userId);
    const isDisliked = sauce.usersDisliked.find( element => element === body.userId);

    if(body.like === 1){
        if (isLiked) return next( new ErrorResponse('user already liked the sauce',409) );
        if (isDisliked) return next( new ErrorResponse('user already disliked the sauce',409) );
        
        sauce.likes++;
        sauce.usersLiked.push(body.userId);
    }

    if(body.like === -1){
        if (isDisliked) return next( new ErrorResponse('user already disliked the sauce',409) );
        if (isLiked) return next( new ErrorResponse('user already liked the sauce',409) );

        sauce.dislikes++;
        sauce.usersDisliked.push(body.userId);
    }

    if(body.like === 0){
        if(!isDisliked && !isLiked ) return next( new ErrorResponse('bad requst, you should like or dislike a sauce before cancling',400) );
        
        if(isLiked && !isDisliked){
            sauce.likes = (sauce.likes === 0) ? 0 : --sauce.likes;
            sauce.usersLiked = sauce.usersLiked.filter( element => element !== body.userId);    
        }

        if(isDisliked && !isLiked){
            sauce.dislikes = (sauce.dislikes === 0) ? 0 : --sauce.dislikes;
            sauce.usersDisliked = sauce.usersDisliked.filter( element => element !== body.userId);
        }
    }

}

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then( sauces => res.status(200).json(sauces) )
        .catch( error => next(error) );
}
 
exports.createSauce = (req, res, next) => {
    console.log('***** in createSauce controller ******');
    try {
        if(!req.file) return next( new ErrorResponse('please provide a file',400) );

        const filePath = getFilePath(req.file.filename);

        if(!req.body.sauce) {
            unlinkFile(filePath,next);
            return next( new ErrorResponse('bad request',400) )
        }

        const { userId } = JSON.parse(req.body.sauce);

        if(userId !== req.auth.userId){
            unlinkFile(filePath,next);
            return next( new ErrorResponse('unauthorized request, invalid credentials',401) );
        }

        const sauce = new Sauce ({
            ...JSON.parse(req.body.sauce),
            imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked : [],
            usersDisliked : [],
        });

        sauce.save()
        .then( () => res.status(201).json({ message:' sauce created successfully ' }) )
        .catch( error => next(error) );

    } catch (error) {
        next(error)
    }
}

exports.getSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then( sauce => {
            if( !sauce ) return next( new ErrorResponse('no matched query',409) );
            res.status(200).json( sauce );
        })
        .catch( error => next(error) );
}

const updateHandler = (req,res,next) => {
    let filePath
    Sauce.findOneAndUpdate({ _id:req.params.id, userId: req.auth.userId },{ ...req.body },{ returnDocument :'before' })
    .then( sauce => {
        if(!sauce && !req.file) {
            return next( new ErrorResponse('no matched query',404))
        } 

        if(!sauce && req.file){
            filePath =  getFilePath(req.file.filename);
            unlinkFile(filePath,next);
            return next( new ErrorResponse('no matched query',404))
        }

        if(req.file){
            const imageFilename = sauce.imageUrl.split('/images/')[1];
            filePath = getFilePath(imageFilename);
            unlinkFile(filePath,next);
        }
        
        res.status(201).json({ message: 'sauce updated successfully'})
    })
    .catch( error => {
        if(req.file) {
            filePath =  getFilePath(req.file.filename);
            unlinkFile(filePath,next)
        }
        next(error);
     });
}

exports.modifySauce = (req, res, next) => {
    console.log('************ in modifySauce controller **************');
    console.log('************ req.body **************',req.body);
    // if update without image file
    try{
        if(!req.file) {
            const { userId } = req.body; 

            if( userId !== req.auth.userId ) return next( new ErrorResponse('unauthorized request',401) );

            updateHandler(req,res,next);

            return
        }
    // if update with image file
        let filePath = getFilePath(req.file.filename);

        if(!req.body.sauce){
            unlinkFile(filePath, next);
            return next( new ErrorResponse('bad request',400) );
        }

        const { userId } = JSON.parse(req.body.sauce);

        if(userId !== req.auth.userId) {
            unlinkFile(filePath, next);
            return next( new ErrorResponse('unauthorized request, invalid credentials',401) );
        }

        const updateObj = {
            ...JSON.parse(req.body.sauce),
            imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };

        req.body = updateObj;

        updateHandler(req,res,next);

    }catch (error) {
        next(error)
    }
}

exports.deleteSauce = (req, res, next) => {
    console.log('************ in deleteSauce controller **************');
    Sauce.findOneAndDelete({ _id: req.params.id, userId: req.auth.userId })
    .then( sauce => {
        if (!sauce) return res.status(404).json({ error:'no matched document' });
        const imageFilename = sauce.imageUrl.split('/images/')[1];
        const filePath = getFilePath(imageFilename);
        unlinkFile(filePath);
        res.status(201).json({ message:'sauce deleted successfully' });
    })
    .catch( (error) => res.status(400).json({ error : error.message}));
}

exports.likeSauce = (req, res, next) => {
    console.log('*********** in likeSauce controller ******')
    console.log('------->req.body----',req.body);
    // const body = req.body;

    Sauce.findOne({ _id : req.params.id })
    .then ( sauce => {
        if(!sauce) throw new Error('bad request, no matched document');
        likeHandler(req.body,sauce);
        const updateObj = {
            likes: sauce.likes,
            dislikes: sauce.dislikes,
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
        }
        return updateObj
    })
    .then( updateObj => {
        console.log('------> SupdateObj from uper then',updateObj);
        Sauce.updateOne({_id : req.params.id},{...updateObj})
        .then(() => {
            if(req.body.like === 1) {
                res.status(201).json({ message:'you like sauce' })
            }
            if(req.body.like === -1) {
                res.status(201).json({ message:'you dislike sauce' })
            }
            if(req.body.like === 0) {
                res.status(201).json({ message:'your cancle is done' })
            } 
        })
        .catch( error => res.status(500).json({ error: error.message}))
    })
    .catch( error => res.status(400).json( {message:error.message}))
        
}

