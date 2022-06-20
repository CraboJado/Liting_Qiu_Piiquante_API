const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: { 
        type:String, 
        required:[true,"Email required"], 
        unique:true,
        trim:true,
        match:[/^.[^éèçàµù@"()\[\]\\<>,;:]+@(?:[\w-]+\.)+\w+$/, 'Please fill a valid email address'],
        lowercase:true
    },
    password: { 
        type: String, 
        required:[true,"password required"]
    }
});

// validator for fileds declared {unique :true}
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User',userSchema);
