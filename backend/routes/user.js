const express = require('express');
const limiter = require('../middlewares/rateLimiter')
const { signup, login } = require('../controllers/user');

const router = express.Router();

router.post('/signup',signup);
router.post('/login',limiter,login);

module.exports = router;

