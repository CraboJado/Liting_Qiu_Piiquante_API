const express = require('express');
const multer = require('../middlewares/multer');
const router = express.Router();

router.get('/',(req,res,next)=>{
    res.status(200).json({response:' get Array of sauces'})
})

router.get('/:id',(req,res,next)=>{
    res.status(200).json({response:' get sauces of id'})
})

router.post('/',multer,(req,res,next)=>{
    console.log('%O', req.body);
    res.status(201).json({response:'  sauces created'})
})

router.put('/:id',(req,res,next)=>{
    res.status(200).json({response:'  sauce of id updated'})
})

router.delete('/:id',(req,res,next)=>{
    res.status(200).json({response:'  sauce of id deleted'})
})

router.post('/:id/like',(req,res,next)=>{
    res.status(200).json({response:' like sauce of id '})
})

module.exports = router;