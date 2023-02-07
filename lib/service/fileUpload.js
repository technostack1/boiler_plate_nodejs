const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const config = require('../../config/environment');


const storageAppUser = multer.diskStorage({
  destination(req, file, cb) {
    let dest = 'public/uploads/attachment/';
    


    cb(null,dest);
  },
  filename(req, file, cb) {
     crypto.pseudoRandomBytes(16, (err, raw) => {
       if (err) return cb(err);
       cb(null, raw.toString('hex')+ path.extname(file.originalname));
      });
  },
  onFileUploadComplete() {
  },
  onError(error, next) {
    console.log('errrrrrrrrrrrr', error)
    next(error);
  },
});


const storage = multer.diskStorage({
  destination(req, file, cb) {
    console.log("destination req",req.body.objectName)
    console.log("destination objectId",req.body.objectId)
    let dest = 'public/uploads/attachment/'+req.body.objectName+'/';
    fs.access(dest, function (error) {
      if (error) {
        console.log("con 1");
        fs.mkdir(dest, (error) => {

          let dest2 = 'public/uploads/attachment/'+req.body.objectName+'/'+req.body.objectId;
          fs.access(dest, function (error) {
            if (error) {
              console.log("con 2");

              cb(null, dest2);

            }else{
              console.log("con 3");

              return fs.mkdir(dest2, (error) => {
                console.log("error",error); 
                cb(error, dest);
              })
    
            }
          });
      
  
        })

      } else {

         let dest2 = 'public/uploads/attachment/'+req.body.objectName+'/'+req.body.objectId;
         fs.access(dest, function (error) {
          if (error) {
            console.log("con 4");

            cb(null, dest2);

          }else{
            console.log("con 5");

            return fs.mkdir(dest2, (error) => {
              console.log("error",error); 
              cb(error, dest2);
            })
  
          }
        });


      }
    });


  },
  filename(req, file, cb) {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      if (err) return cb(err);
      console.log("file",file);

      cb(null, raw.toString('hex')+ path.extname(file.originalname));
    });
  },
  onFileUploadComplete() {
  },
  onError(error, next) {
    console.log('errrrrrrrrrrrr', error)
    next(error);
  },
});

exports.upload = multer({
  storage: storage, fileFilter(req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted
    console.log('file', file);
    if (file.mimetype !== 'image/*' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg') {
      console.log('extt11', file.mimetype);
      req.fileValidationError = true;
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }
    const fileExtension = path.extname(file.originalname).toLowerCase();
    console.log('extt1', fileExtension);
    if (fileExtension !== '.jpg' && fileExtension !== '.jpeg' && fileExtension !== '.png') {
      console.log('extt', fileExtension);
      req.fileValidationError = true;
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }
    // To reject this file pass `false`, like so:
    // cb(null, false)

    // To accept the file pass `true`, like so:
    cb(null, true)

    // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'))

  },
}).array('image', 3);


exports.uploadFile = multer({
  storage: storageAppUser, fileFilter(req, file, cb) {

    const mimeTypeArray = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/plain', 'application/x-compressed', 'application/zip', ];
      if (!mimeTypeArray.includes(file.mimetype)) {
        req.fileValidationError = true;
        console.log('******************')
        return cb(null, false, new Error('goes wrong on the mimetype'));
      }
    const fileExtension = path.extname(file.originalname).toLowerCase();
    console.log('extt1', fileExtension);
    if (fileExtension !== '.jpg' && fileExtension !== '.jpeg' && fileExtension !== '.png' && fileExtension !== '.bmp'
     && fileExtension !== '.doc' && fileExtension !== '.docx' && fileExtension !== '.xls' && fileExtension !== '.xlsx' &&
     fileExtension !== '.csv' && fileExtension !== '.pptx' && fileExtension !== '.pdf' && fileExtension !== '.rtf' && fileExtension !== '.zip' 
  ) {
      console.log('extt', fileExtension);
      req.fileValidationError = true;
      console.log('------------------')
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }
    cb(null, true)

  }
}).single('file');


exports.uploadUserProfile = multer({
  storage: storageAppUser, fileFilter(req, file, cb) {

    const mimeTypeArray = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/plain', 'application/x-compressed', 'application/zip', ];
      if (!mimeTypeArray.includes(file.mimetype)) {
        req.fileValidationError = true;
        console.log('******************')
        return cb(null, false, new Error('goes wrong on the mimetype'));
      }
    const fileExtension = path.extname(file.originalname).toLowerCase();
    console.log('extt1', fileExtension);
    if (fileExtension !== '.jpg' && fileExtension !== '.jpeg' && fileExtension !== '.png' && fileExtension !== '.bmp'
     && fileExtension !== '.doc' && fileExtension !== '.docx' && fileExtension !== '.xls' && fileExtension !== '.xlsx' &&
     fileExtension !== '.csv' && fileExtension !== '.pptx' && fileExtension !== '.pdf' && fileExtension !== '.rtf' && fileExtension !== '.zip' 
  ) {
      console.log('extt', fileExtension);
      req.fileValidationError = true;
      console.log('------------------')
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }
    cb(null, true)

  }
}).single('file');
