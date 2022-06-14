
exports.passwordValidator = (req, res, next) => {
    const { password } = req.body
    const reg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/;
    if(! reg.test(password)) 
    return res
    .status(400)
    .json({ messagePASS: `Minimum 8 characters, at least One Upper Case Character, one Lower Case character, one digit, one special character @$!%*#?&^_-` })
    
    next();
}