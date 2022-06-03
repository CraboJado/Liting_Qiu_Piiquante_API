const multer = require('multer');

const MIME_TYPES = {
    'image/jpg' :'jpg',
    'image/jpeg' :'jpg',
    'image/png' :'jpg'
}

const storage = multer.diskStorage({
    destination : (req, file, callback) => {
        console.log('********** destination cb ***************');
        callback(null, 'public/images');
    },
    filename : (req, file, callback) => {
        console.log('********** filename cb ***************');
        const regEx = /[\.\s-]/g;
        const name = file.originalname.replace(regEx,'_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name +'_'+ Date.now() +'.'+ extension);
    }
})

const fileFilter = (req, file, callback) => {
    console.log('********** fileFilter cb ***************');
    if((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')){
        callback(null, true);
    }else {
        callback(null, false);
    }
}

const upload = multer({ storage , fileFilter})

module.exports = upload.single('image');