const express = require('express');
const app = express();

app.use((req,res) => {
    res.send('Hello World!')
})
// console.log(typeof app);
// console.log(app.toString());

module.exports = app;