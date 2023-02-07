// const aes = require('aes-cross');
const aes = require('./aesEncryption');
const bcrypt = require('bcrypt');
const config = require('../../config/environment');
const key = new Buffer(config.aesKeys.encryption);
const qrKey = new Buffer(config.aesKeys.qrCode);

exports.encryptData = function encryptData(data) {
  return aes.encText(JSON.stringify(data), key);;
}
exports.encryptQrData = function encryptQrData(data) {
  return aes.encText(JSON.stringify(data), qrKey);;
}
exports.decryptQrData = function decryptQrData(data) {
  if (data) {
    return JSON.parse(aes.decText(data, qrKey));
  } else {
    return false;
  }

}

exports.decryptData = decryptData = (data) => {
  if (data) {
    const resp = aes.decText(data, key);
    try {
      let respJson = JSON.parse(resp);

      for (var objKey in respJson) {

        console.log('type of', typeof respJson[objKey]);
        if (respJson[objKey] && typeof respJson[objKey] !== 'number' && typeof respJson[objKey] !== 'object' && typeof respJson[objKey] !== 'boolean') {
          respJson[objKey] = respJson[objKey].replace(/  +/g, ' ').trim();
        }
      }
      return respJson;
    } catch (e) {
      console.log('e', e);
      return {};
    }
  } else {
    return {};
  }

}

exports.decryptString = function decryptData(data) {
  const decryptedData = aes.decText(data, key);
  // var objKeysRegex = /({|,)(?:\s*)(?:')?([A-Za-z_$\.][A-Za-z0-9_ \-\.$]*)(?:')?(?:\s*):/g;// look for object names
  // var newQuotedKeysString = decryptedData.replace(objKeysRegex, "$1\"$2\":");// all object names should be double quoted
  return decryptedData;
}

exports.encryptString = function encryptData(data) {
  let newData = JSON.parse(data);
  return aes.encText(data.toString(), key);
}

exports.encryptPin = (pin) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10)
      .then(salt => {
        // hash the password along with our new salt
        bcrypt.hash(pin, salt)
          .then(passwordHash => {
            console.log('passwordHash', passwordHash)
            resolve(passwordHash);
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
}


exports.validatePassword = (encryptedPin, pin) => {
  return bcrypt.compareSync(pin, encryptedPin);
}