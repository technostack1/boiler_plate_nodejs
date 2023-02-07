const path = require('path');
var app = require('express')();
Promise = require('bluebird');

const auth = require("./auth/user.auth");
const config = require('./config/environment');
const db = require('./config/dbConnection')


const jwt = require("jsonwebtoken");
const responseHandler = require('./lib/service/responseHandler');
const multer = require('multer')
const imagesUpload = require('./lib/service/fileUpload');

module.exports = (app) => {
    app.use('/api/v1', require('./api/common/routes/routes'));
    //###############  stack Routes  ###########################
 
    app.route('/*')
        .get((req, res) => {
            res.send({'error':'404'});
        });
}