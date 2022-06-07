const express = require('express');
const multer = require('../middlewares/multer-config');
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/',sauceCtrl.getAllSauces)

router.get('/:id',sauceCtrl.getSauce)

router.post('/',auth,multer,sauceCtrl.createSauce);

router.put('/:id',auth,multer,sauceCtrl.modifySauce);

router.delete('/:id', auth, multer, sauceCtrl.deleteSauce)

router.post('/:id/like', auth, sauceCtrl.likeSauce)

module.exports = router;