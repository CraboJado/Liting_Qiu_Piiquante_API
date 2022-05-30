const express = require('express');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const app = express();

// parse req.body
app.use(express.json());

// handle cors problem
app.use((req, res, next) => {
    // res.set({
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization',
    //     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    // })

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    next();
})

app.use('/api/auth',userRoutes);
app.use('/api/sauces',sauceRoutes);
// console.log(typeof app);
// console.log(app.toString());

module.exports = app;