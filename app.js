const express = require('express');
const path = require('path');
const helmet = require('helmet');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const errorHandler = require('./middlewares/error');

const app = express();

// secure http server
app.use(helmet({
    crossOriginResourcePolicy: false,
  })
);

// parse req.body for JSON format
app.use(express.json());

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// handle cors problem
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
})

app.use('/api/auth',userRoutes);
app.use('/api/sauces',sauceRoutes);

// handle error middleware
app.use(errorHandler);

module.exports = app;
