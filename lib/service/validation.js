let isEmpty = (value) => {
    if (!value) {
        return true;
    }
    if (typeof value === 'undefined' || value.length === 0) {
        return true;
    }
    if (typeof value !== 'number') {
        if (value.trim().length === 0) {
            return true;
        }
    }
    return false;
}
/* Send Response*/
exports.resHandler = function resHandler(success, data, message, res, status) {
    return res.status(status).json({ success, data, error: message });
};
let validateDigits = (value, fixedLength) => {
    if (isEmpty(value)) {
        return false;
    }
    if (isNaN(value)) {
        return false;
    }
    if (fixedLength) {
        if (value.length !== fixedLength) {
            return false;
        }
    }
    return true;
}

let validateObjectId = (value) => {
    if (isEmpty(value)) {
        return false;
    }
    if (value.length != 24) {
        return false;
    }
    return true;
}

let validateId = (value) => {
    if (isEmpty(value)) {
        return false;
    } if (isNaN(value)) {
        return false;
    }
    return true;
}
const isObject = (value) => {
    return (value !== null && typeof value === 'object' && !Array.isArray(value));
}

const validateEmail = (email) => {
    if (isEmpty(email)) {
        return false;
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const validatePhone = (phone) => {
    if (isEmpty(phone)) {
        return false;
    }
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(String(phone).toLowerCase());
}
const validateZip = (zipcode) => {
    if (isEmpty(zipcode)) {
        return false;
    }
    var re = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    return re.test(String(zipcode).toLowerCase());
}
const escapeSpecial = (data) => {
    if (isEmpty(data)) {
        return false;
    }
    return data.replace('%3C', "").replace('%3E', "").replace('&lt;','').replace('&gt;','');
}

exports.isEmpty = isEmpty;
exports.validateDigits = validateDigits;
exports.validateObjectId = validateObjectId;
exports.validateId = validateId;
exports.isObject = isObject;
exports.validateEmail = validateEmail;

exports.validatePhone = validatePhone;
exports.validateZip = validateZip;
exports.escapeSpecial = escapeSpecial;

