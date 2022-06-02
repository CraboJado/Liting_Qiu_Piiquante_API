const express = require('express');
const path = require('path');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
// const bodyParser = require('body-parser');

const app = express();
// parse req.body
app.use(express.json());
// app.use(bodyParser.json());

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

module.exports = app;