const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// import express app
const app = require('./app');

// use environment variable
dotenv.config();

// connect to mongoDB database
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.dkktm.mongodb.net/?retryWrites=true&w=majority`)
  .then( ( ) => console.log('Successfully connect to mongoDB database '))
  .catch( ( error ) => console.log( error + 'Unsuccessfully connect to mongoDB database')) 
  // dans le doc., handleError(error) , qu'est ce qu'on peut faire dans la fonction handleError

// pourquoi normalizePort ? si je utilise diretement process.env.PORT || '3000', il aura quoi comme problem ?
const normalizePort = val => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
      return val;
    }
    if (port >= 0) {
      return port;
    }
    return false;
  };

  const port = normalizePort(process.env.PORT || '3000');

  const errorHandler = error => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    //console.log(address) output : null
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges.');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use.');
        // existe Nodejs program, like we do 'crlt +c'
        process.exit(1);
        break;
      default:
        throw error;
    }
  };

// app.set('port', process.env.PORT || 3000); 
app.set('port', port); // pourquoi , car sans app.set('port'), ca marche aussi ???

// create a server node : http server and pass express app to handle incoming http request
const server = http.createServer(app);

// handle http request event
server.on('error',errorHandler);
server.on('listening', () => {
    //console.log(address) : { address: '::', family: 'IPv6', port: 3000 }
    const address = server.address(); 
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; // example de pipe ??
    console.log('Listening on ' + bind);
  });

server.listen(port);  // la différence par rapport à la ligne 66 ?
// server.listen(process.env.PORT || 3000);

