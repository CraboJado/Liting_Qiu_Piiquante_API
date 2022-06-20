const mongoose = require('mongoose');

const connectMongoDB = () => {
  mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.dkktm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  .then( ( ) => console.log('Successfully connect to mongoDB database '))
  .catch( ( error ) => console.log( error + 'Unsuccessfully connect to mongoDB database')) 
}

module.exports = connectMongoDB;
