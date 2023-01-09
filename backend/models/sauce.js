const mongoose = require('mongoose');
const { Schema } = mongoose;
const sauceSchema = new Schema({
    userId: { type:String, required:true },
    name: { type:String, required:true },
    manufacturer: { type:String, required:true },
    description: { type:String, required:true },
    mainPepper: { type:String, required:true },
    imageUrl: { type:String, required:true },
    heat: Number,
    likes: Number,
    dislikes: Number,
    usersLiked : Array,
    usersDisliked : Array,
})

module.exports = mongoose.model('Sauce',sauceSchema);