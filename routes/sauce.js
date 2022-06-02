const express = require('express');
const multer = require('../middlewares/multer-config');
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middlewares/auth');
const router = express.Router();


router.get('/',sauceCtrl.getAllSauces)

router.get('/:id',sauceCtrl.getSauce)

// router.post('/',multer,auth,sauceCtrl.createSauce);
router.post('/',auth,multer,sauceCtrl.createSauce);

// router.put('/:id',multer,auth,sauceCtrl.modifySauce);
router.put('/:id',auth,multer,sauceCtrl.modifySauce);

// router.delete('/:id',multer,auth,(req,res,next)=>{
//     res.status(200).json({response:'  sauce of id deleted'})
// })

router.delete('/:id',auth, multer, (req,res,next)=>{
    res.status(200).json({response:'  sauce of id deleted'})
})

router.post('/:id/like',multer,auth,(req,res,next)=>{
    res.status(200).json({response:' like sauce of id '})
})

module.exports = router;