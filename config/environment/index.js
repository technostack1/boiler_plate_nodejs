const _ = require('lodash');
const path = require('path');

let requiredProcessEnv = (name) => {
    if (!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
};

let environmentSettings = {
    env: process.env.NODE_ENV,
    root: path.normalize(`${__dirname}/../../`),
    port: process.env.PORT || 4000,
    ip: process.env.IP || '0.0.0.0',
    secrets: {
        key: 'ad01APt$#@!!!!#sFbS5#5s'
    },
    aesKeys: {
        encryption: [90, -100, 15, 74, -128, 113, 92, 31, 02, 111, 56, 36, 005, -15, -55, -91],
        decription: [-20, 99, 120, -48, 23, -13, 49, 16, 60, -123, 89, -99, 65, 1, -98, 113],
    },
   //  baseUrl : "http://ec2-54-205-5-216.compute-1.amazonaws.com:3000/",
     clientUrl : "http://ec2-54-205-5-216.compute-1.amazonaws.com/",
     baseUrl : 'http://localhost:3000/',
     imagePath : 'http://134.122.20.35:4000/uploads/attachment/',
     key : '',

    dbConfig: {
        host: 'localhost',
        user: 'sbs2',//sbs2
        pw: 'ag01Aft#@2', //ag01Aft#@2
        db: 'sbs',
        dbType: 'mysql' //mssql
    },
    fcmConfiguration: {
        serverKey: 'AAAAm7b_ZJw:APA91bEbQxSr22qDXjWWyjULEWLUffSiJWSsypSrBQGwRIOEtmmO79Glr0Mjf7sB7i4JhmI10j2nZjTssyx8xgihp83z_EPlYX22dztzjuYKkFPX5xe5YvQLTKJIxqOBSQCJWUDhy_aj',
        MerchantServerKey: ''
    },    

    fileConfiguration: {
        path: 'public/uploads/attachment'
    },
};
module.exports = _.merge(environmentSettings, require('./' + process.env.NODE_ENV + '.js') || {})