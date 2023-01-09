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

const updateHandler = (req,res,next) => {
    let filePath
    Sauce.findOneAndUpdate({ _id:req.params.id, userId: req.auth.userId },{ ...req.body },{ returnDocument :'before' })
    .then( sauce => {
        // when the sauce is not created by the user, user is not allowed to modify the sauce 
        // and need to delete the uploaded file if file is uploaded
        if(!sauce && !req.file) {
            return next( new ErrorResponse('no matched query',404))
        } 

        if(!sauce && req.file){
            filePath =  getFilePath(req.file.filename);
            unlinkFile(filePath,next);
            return next( new ErrorResponse('no matched query',404))
        }

        // when the sauce is created by the user, user is allowed to modify the sauce
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

const likeHandler = (body, sauce) => {
    const isLiked = sauce.usersLiked.find( element => element === body.userId);
    const isDisliked = sauce.usersDisliked.find( element => element === body.userId);

    if(body.like === 1){
        sauce.likes++;
        sauce.usersLiked.push(body.userId);
    }

    if(body.like === -1){
        sauce.dislikes++;
        sauce.usersDisliked.push(body.userId);
    }

    if(body.like === 0){
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
        .catch( error => {
            unlinkFile(filePath,next);
            next(error)
        } );

    } catch (error) {
        next(error)
    }
}

exports.getSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then( sauce => {
            if( !sauce ) return next( new ErrorResponse('no matched query',404) );
            res.status(200).json( sauce );
        })
        .catch( error => next(error) );
}

exports.modifySauce = (req, res, next) => {
    try{
        // if update without image file
        if(!req.file) {
            const { userId } = req.body; 

            if( userId !== req.auth.userId ) return next( new ErrorResponse('unauthorized request',401) );

            updateHandler(req,res,next);

            return
        }

    // when update with image file, need to parse body to get userId
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
    Sauce.findOneAndDelete({ _id: req.params.id, userId: req.auth.userId })
    .then( sauce => {
        if (!sauce) return next( new ErrorResponse('no matched query',404) );

        const imageFilename = sauce.imageUrl.split('/images/')[1];
        const filePath = getFilePath(imageFilename);
        unlinkFile(filePath,next);
        res.status(201).json({ message:'sauce deleted successfully' });
    })
    .catch( error => next(error) );
}

exports.likeSauce = (req, res, next) => {
    if(req.body.userId !== req.auth.userId) 
    return next( new ErrorResponse('unauthorized request, invalid credentials',401) )

    Sauce.findOne({ _id : req.params.id })
    .then ( sauce => {
        if(!sauce) return Promise.reject(new ErrorResponse('no matched query',404));

        const isLiked = sauce.usersLiked.find( element => element === req.body.userId);
        const isDisliked = sauce.usersDisliked.find( element => element === req.body.userId);

        if(req.body.like === 1){
            if (isLiked) return Promise.reject( new ErrorResponse('can not like the sauce twice',409) );
            if (isDisliked) return Promise.reject( new ErrorResponse('can not like the sauce you disliked',409) );
        }

        if(req.body.like === -1){
            if (isDisliked) return Promise.reject( new ErrorResponse('can not dislike the sauce twice',409) );
            if (isLiked) return Promise.reject( new ErrorResponse('can not dislike the sauce you liked ',409) );
        }

        if(req.body.like === 0){
            if(!isDisliked && !isLiked ) return Promise.reject( new ErrorResponse('bad requst',400) );
        }

        likeHandler(req.body, sauce);

        const updateObj = {
            likes: sauce.likes,
            dislikes: sauce.dislikes,
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
        }

        return updateObj 
    })
    .then( updateObj => {
        Sauce.updateOne({_id : req.params.id},{...updateObj})
        .then(() => {
            if(req.body.like === 1) {
                res.status(201).json({ message:'like sauce successfully' })
            }

            if(req.body.like === -1) {
                res.status(201).json({ message:'dislike sauce successfully' })
            }

            if(req.body.like === 0) {
                res.status(201).json({ message:'cancle successfully' })
            } 
        })
        .catch( error => next(error) )
    })
    .catch( error => next(error) )   
}

