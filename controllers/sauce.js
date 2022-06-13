const Sauce = require('../models/sauce');
const fs = require('fs');
const path = require('path');
const req = require('express/lib/request');

const getFilePath = (filename) => {
    return path.join(__dirname, `../public/images/${filename}`);
}

// const unlinkFile = (req, res) => {
//     if(!req.body.sauce) {
//         fs.unlink(req.filePath, ( error ) => {
//             if (error) throw new Error('something is wrong')
//             res.status(400).json({ error:'bad request' });
//         })
//         return
//     }

//     const{ userId } = JSON.parse(req.body.sauce);
//     fs.unlink(req.filePath, error => {
//         if (error) throw new Error('something is wrong'); 

//         if(userId !== req.auth.userId) 
//         return res.status(401).json({ error:'unauthorized request' });

//         if(req.sauceIsNull)
//         return res.status(404).json({ error: 'no matched document'});

//         res.status(201).json({ message:'sauce updated successfully' });
//     });
// }

const unlinkFile = (file) => {
    fs.unlink(file, err => {
        if(err) throw new Error('something is wrong, unlinking file fails');
    })
}


exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then( sauces => res.status(200).json(sauces) )
        .catch( error => res.status(500).json({ error }) );
}
 

// exports.createSauce = (req, res, next) => {
//     console.log('***** in createSauce controller ******');
//     console.log('***** req.body ******',req.body);
//     try {
//         if(!req.file) return res.status(400).json({ error:'please provide a file' });
//         const filePath = getFilePath(req.file.filename);
//         if(!req.body.sauce) {
//             unlinkFile(filePath);
//             return res.status(400).json({ error:'bad request' });
//         }
//         const { userId } = JSON.parse(req.body.sauce);
//         if(userId !== req.auth.userId){
//             unlinkFile(filePath);
//             return res.status(401).json({ error:'unauthorized request' });
//         }
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }

//     const sauce = new Sauce ({
//         ...JSON.parse(req.body.sauce),
//         imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
//         likes: 0,
//         dislikes: 0,
//         usersLiked : [],
//         usersDisliked : [],
//     });
//     sauce.save()
//     .then(() => {
//         res.status(201).json({ response:' sauce created successfully ' });
//     })
//     .catch( error => res.status(400).json({ error : error.message }) );
   
// }

exports.createSauce = (req, res, next) => {
    console.log('***** in createSauce controller ******');
    try {
        if(!req.file) return res.status(400).json({ error:'please provide a file' });
        const filePath = getFilePath(req.file.filename);
        if(!req.body.sauce) {
            unlinkFile(filePath);
            return res.status(400).json({ error:'bad request' });
        }
        const { userId } = JSON.parse(req.body.sauce);
        if(userId !== req.auth.userId){
            unlinkFile(filePath);
            return res.status(401).json({ error:'unauthorized request, invalid credentials' });
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
        .then(() => {
            res.status(201).json({ message:' sauce created successfully ' });
        })
        .catch( error => { throw new Error('something is wrong, creating fails') });
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

exports.getSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then( sauce => {
            if( !sauce ) return res.status(409).json({ error :'no matched document'});
            res.status(200).json( sauce );
        })
        .catch( error => res.status(400).json( { error }) );
}

exports.modifySauce = (req, res, next) => {
    console.log('************ in modifySauce controller **************');
    if(!req.file) {
        const { userId } = req.body; 
        if(!userId) return res.status(401).json({ error: 'unauthorized request' });

        Sauce.updateOne({ _id: req.params.id, userId: req.auth.userId },{ ...req.body })
        .then( sauce => {
            if(sauce.matchedCount === 0) 
            return res.status(409).json({ error: 'no matched document'});
            res.status(201).json({ message:'sauce updated successfully'});
        })
        .catch( error => res.status(400).json({ error }));
        return
    }

    if(!req.body.sauce){
        req.filePath = getFilePath(req.file.filename);
        unlinkFile(req,res);
        return
    }

    // authenticate user before updating sauce with coming-in file
    const { userId } = JSON.parse(req.body.sauce);
    req.filePath = getFilePath(req.file.filename);

    if(userId !== req.auth.userId) {
        unlinkFile(req,res);
        return   
    }

    const updateObj = {
        ...JSON.parse(req.body.sauce),
        imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    };
    Sauce.findOneAndUpdate({ _id:req.params.id, userId: req.auth.userId },{ ...updateObj },{ returnDocument :'before' })
    .then( sauce => {
        if(!sauce) {
            req.sauceIsNull = true;
            unlinkFile(req,res);
            return
        } 
        const imageFilename = sauce.imageUrl.split('/images/')[1];
        req.filePath = getFilePath(imageFilename);
        unlinkFile(req,res);
    })
    .catch( error => {
        fs.unlink(filePath, error => {
            if (error) throw new Error('something is wrong');
        })
        res.status(400).json( { error });
    });

}

exports.deleteSauce = (req, res, next) => {
    console.log('************ in deleteSauce controller **************');
    Sauce.findOneAndDelete({ _id: req.params.id, userId: req.auth.userId })
    .then( sauce => {
        if (!sauce) return res.status(409).json({ error:'no matched document' });
        const imageFilename = sauce.imageUrl.split('/images/')[1];
        const filePath = getFilePath(imageFilename);
        fs.unlink(filePath, error => {
            if (error) throw new Error('something is wrong');
        });
        res.status(201).json({ message:'sauce deleted successfully' });
    })
    .catch( (error) => res.status(400).json({ error }));
}

const likeHandler = (body, sauce) => {
    const isLiked = sauce.usersLiked.find( element => element === body.userId);
    const isDisliked = sauce.usersDisliked.find( element => element === body.userId);

    if(body.like === 1){
        if (isLiked){
            throw new Error('1you already Liked the sauce');
        }

        if (isDisliked){
            throw new Error('1you already Disliked the sauce,you should cancle your dislike before liking');
        }

        sauce.likes++;
        sauce.usersLiked.push(body.userId);
        console.log('------> Sauce After change',sauce);
    }

    if(body.like === -1){
        if (isDisliked){
            throw new Error('-1you already Disliked the sauce');
        }

        if (isLiked){
            throw new Error('-1you already Liked the sauce, you should cancle your like before disliking');
        }

        sauce.dislikes++;
        sauce.usersDisliked.push(body.userId);
        console.log('------> Sauce After change',sauce);
        
    }

    if(body.like === 0){
        if(!isDisliked && !isLiked ){
            throw new Error('bad requst, you should like or dislike a sauce before cancling');
        }
        if(isLiked && !isDisliked){
            sauce.likes = (sauce.likes === 0) ? 0 : --sauce.likes;
            sauce.usersLiked = sauce.usersLiked.filter( element => element !== body.userId);
            console.log('userId is in usersLiked array, user cancle like');
            console.log('------> Sauce After change',sauce);
                
        }
        if(isDisliked && !isLiked){
            sauce.dislikes = (sauce.dislikes === 0) ? 0 : --sauce.dislikes;
            sauce.usersDisliked = sauce.usersDisliked.filter( element => element !== body.userId);
            console.log('userId is in usersDislike array, user cancle dislike');
            console.log('------> Sauce After change',sauce);
        }
    }

}


exports.likeSauce = (req, res, next) => {
    console.log('*********** in likeSauce controller ******')
    console.log('------->req.body----',req.body);
    // const body = req.body;

    Sauce.findOne({ _id : req.params.id })
    .then ( sauce => {
        if(!sauce) throw new Error('bad request, no matched document');
        likeHandler(req.body,sauce);
        return sauce
    })
    .then( sauce => {
        console.log('------> Sauce from uper then',sauce);
        const updateObj = {
            likes: sauce.likes,
            dislikes: sauce.dislikes,
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
        }
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
        .catch( error => res.status(400).json({ errorupdateOne: error}))
    })
    .catch( error => res.status(400).json( {message:error.message}))
        
}

