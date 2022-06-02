const multer = require('multer');

const MIME_TYPES = {
    'image/jpg' :'jpg',
    'image/jpeg' :'jpg',
    'image/png' :'jpg'
}

const storage = multer.diskStorage({
    destination : (req, file, callback) => {
        console.log('multer destination***************');
        console.log(req.body);
        callback(null, 'public/images');
    },
    filename : (req, file, callback) => {
        console.log('multer filename***************');
        console.log(req.body);
        const regEx = /[\.\s-]/g;
        const name = file.originalname.replace(regEx,'_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name +'_'+ Date.now() +'.'+ extension);
    }
})

const fileFilter = (req, file, callback) => {
    if((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')){
        console.log('fileFilter***************');
        console.log(req.body);
        callback(null, true);
    }else {
        callback(null, false);
    }
}

const upload = multer({ storage , fileFilter})

module.exports = upload.single('image');