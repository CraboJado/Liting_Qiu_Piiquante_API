const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const app = require('./app');
const connectMongoDB = require('./config/db')
const dotenv = require('dotenv');

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

const errorHandler = error => {
    if (error.syscall !== 'listen') {
      throw error; 
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges.');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use.');
        process.exit(1);
        break;
      default:
        throw error;
    }
};

// use environment variable
dotenv.config();

// connect to mongoDB database
connectMongoDB();

const port = normalizePort(process.env.PORT || '3000');

app.set('port', port); 
// create a server and pass express app to handle incoming request
let server 
if(process.env.ENVIRONNEMENT == "prod") {
   server = https.createServer(
    {
    key:fs.readFileSync(path.join(__dirname,'certificate','key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'certificate','cert.pem'))
    },
    app
  );
} else {
   server = http.createServer(app);
}

// handle http request event
server.on('error',errorHandler);
server.on('listening', () => {
    const address = server.address(); 
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; 
    console.log('Listening on ' + bind);
  });

server.listen(port);  

