const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: { type:String, required:true, unique:true, lowercase:true},
    password: { type: String, required:true}
})

// validator for declared unique fileds
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User',userSchema);