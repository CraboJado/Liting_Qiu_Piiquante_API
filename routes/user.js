const express = require('express');
const { signup, login } = require('../controllers/user');
const { passwordValidator } = require('../middlewares/validator');

const router = express.Router();

router.post('/signup',passwordValidator,signup);
router.post('/login',login);

module.exports = router;

